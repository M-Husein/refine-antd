import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { message, Button, Flex, Input, Modal, Upload } from 'antd';
import type { UploadProps, UploadRef } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import {
  CameraOutlined,
  DesktopOutlined,
  InboxOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useTranslate } from '@refinedev/core';

export type FilePickerProps = Omit<UploadProps, 'children'> & {
  /** Maximum size per file, in bytes. Larger files are rejected. */
  maxBytes?: number;
  /** Show the webcam (selfie) button. Hidden if the browser does not support it. */
  webcam?: boolean;
  /** Show the screen capture button. Hidden if the browser does not support it. */
  screenCapture?: boolean;
  /** Show the "From URL" button: add a file by entering a link (fetched in the browser). */
  pasteUrl?: boolean;
  /**
   * Custom fetch for `pasteUrl`, e.g. through a backend proxy to get around CORS.
   * Must resolve with the file as a Blob and reject on failure.
   */
  fetchUrl?: (url: string, signal: AbortSignal) => Promise<Blob>;
  /** Timeout of the URL fetch in ms. Default 15000. */
  urlTimeout?: number;
  /** Slot for extra buttons (File Manager, Google Drive, ...). */
  renderExtra?: () => ReactNode;
  /** Custom content of the drop area. Defaults to icon + text + hint. */
  children?: ReactNode;
  /** Text shown under the main text of the drop area. */
  hint?: ReactNode;
  /** Ref of the underlying antd Upload (`nativeElement`, `upload`). React 19: `ref` is a regular prop. */
  ref?: Ref<UploadRef>;
};

type CaptureKind = 'webcam' | 'screen';

const videoclassName = "block aspect-video w-full object-contain bg-black rounded";

const GENERIC_PASTE_NAMES = new Set(['image.png', 'image.jpg', 'image.jpeg', 'image.gif', 'image.webp']);

const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${+(bytes / 1024).toFixed(1)} KB`;
  return `${+(bytes / 1024 ** 2).toFixed(1)} MB`;
};

/** Minimal `accept` matcher: ".pdf", "image/*", "application/json". */
const matchesAccept = (file: File, accept?: UploadProps['accept']) => {
  const rules = typeof accept === 'string' ? accept : accept?.format;
  if (!rules) return true;
  const type = file.type.toLowerCase();
  return rules
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule);
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
};

const supportsWebcam = () =>
  // typeof window !== 'undefined' && // to support SSR
  window.isSecureContext &&
  !!navigator.mediaDevices?.getUserMedia;

const supportsScreen = () =>
  // typeof window !== 'undefined' && // to support SSR
  window.isSecureContext &&
  !!navigator.mediaDevices?.getDisplayMedia;

/* ------------------------------ URL -> File ------------------------------ */

type UrlErrorCode = 'invalid' | 'protocol' | 'network' | 'http' | 'timeout' | 'type' | 'size' | 'aborted';

class UrlError extends Error {
  code: UrlErrorCode;
  status?: number;
  constructor(code: UrlErrorCode, status?: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  json: 'application/json',
  txt: 'text/plain',
  csv: 'text/csv',
};

const EXT_BY_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(MIME_BY_EXT)
    .filter(([ext]) => ext !== 'jpeg')
    .map(([ext, mime]) => [mime, ext])
);

const filenameFromDisposition = (header: string | null) => {
  if (!header) return undefined;
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header)?.[1];
  if (star) {
    try {
      return decodeURIComponent(star.trim().replace(/^"|"$/g, ''));
    } catch {
      /* fall through to the plain filename */
    }
  }
  return /filename="?([^";]+)"?/i.exec(header)?.[1]?.trim();
};

type FetchedBlob = { blob: Blob; name?: string };

const defaultFetch = async (
  url: string,
  signal: AbortSignal,
  maxBytes?: number
): Promise<FetchedBlob> => {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new UrlError('http', res.status);

  // Fail fast, before downloading the body
  const length = Number(res.headers.get('content-length'));
  if (maxBytes && length > maxBytes) {
    void res.body?.cancel();
    throw new UrlError('size');
  }

  return {
    blob: await res.blob(),
    name: filenameFromDisposition(res.headers.get('content-disposition')),
  };
};

type UrlToFileOptions = {
  signal?: AbortSignal;
  accept?: UploadProps['accept'];
  maxBytes?: number;
  timeout?: number;
  fetchUrl?: FilePickerProps['fetchUrl'];
};

/** Fetches a URL and converts the response to a `File`. Throws `UrlError`. */
const urlToFile = async (
  rawUrl: string,
  { signal, accept, maxBytes, timeout = 15000, fetchUrl }: UrlToFileOptions
): Promise<File> => {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UrlError('invalid');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new UrlError('protocol');

  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  signal?.addEventListener('abort', onAbort);
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, timeout);

  let fetched: FetchedBlob;
  try {
    fetched = fetchUrl
      ? { blob: await fetchUrl(url.href, ctrl.signal) }
      : await defaultFetch(url.href, ctrl.signal, maxBytes);
  } catch (err) {
    if (err instanceof UrlError) throw err;
    if (timedOut) throw new UrlError('timeout');
    if (signal?.aborted || (err as DOMException)?.name === 'AbortError') throw new UrlError('aborted');
    // fetch() rejects with a TypeError on network errors, which includes CORS failures
    throw new UrlError('network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }

  const { blob } = fetched;
  if (maxBytes && blob.size > maxBytes) throw new UrlError('size');

  // File name: Content-Disposition > last URL path segment > url-<timestamp>.<ext>
  const rawType = blob.type.split(';')[0].trim().toLowerCase();
  let lastSegment = url.pathname.split('/').filter(Boolean).pop() ?? '';
  try {
    lastSegment = decodeURIComponent(lastSegment);
  } catch {
    /* keep the raw segment */
  }
  let name = (fetched.name || lastSegment).replace(/[\\/]/g, '_');
  const ext = /\.([a-z0-9]{1,8})$/i.exec(name)?.[1]?.toLowerCase();
  if (!ext) {
    const guessed = EXT_BY_MIME[rawType];
    name = `url-${timestamp()}${guessed ? `.${guessed}` : ''}`;
  }

  // Type: response type, or guessed from the extension when the server sends none
  const type =
    rawType && rawType !== 'application/octet-stream' ? rawType : (ext && MIME_BY_EXT[ext]) || rawType;

  const file = new File([blob], name, { type });
  if (!matchesAccept(file, accept)) throw new UrlError('type');
  return file;
};

type CaptureModalProps = {
  msg: MessageInstance;
  kind: CaptureKind | null;
  onClose: () => void;
  onCapture: (file: File, kind: CaptureKind) => void;
};

const CaptureModal = ({ 
  msg,
  kind, 
  onClose, 
  onCapture 
}: CaptureModalProps) => {
  const t = useTranslate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [shot, setShot] = useState<{ file: File; url: string } | null>(null);

  // Effect Events (React 19.2+): always see the latest props/translate without
  // re-running the stream effect on every parent render.
  const handleClose = useEffectEvent(() => onClose());
  const handleError = useEffectEvent((key: string, fallback: string) => msg.error(t(key, fallback)));

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // Callback ref: attach an already running stream as soon as <video> mounts (Modal mounts lazily).
  const setVideoEl = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current && el.srcObject !== streamRef.current) {
      el.srcObject = streamRef.current;
    }
  }, []);

  // Start/stop the stream together with the modal.
  useEffect(() => {
    if (!kind) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShot(null);

    (async () => {
      try {
        const stream =
          kind === 'webcam'
            ? await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            : await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });

        // Modal was closed while waiting for permission / the screen picker: release immediately.
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        // User stopped sharing via the browser UI
        stream.getVideoTracks()[0]?.addEventListener('ended', () => handleClose());
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        if (cancelled) return;
        const name = (err as DOMException)?.name;
        if (name !== 'AbortError' && name !== 'NotAllowedError') {
          handleError('filePicker.captureFailed', 'Unable to access the device.');
        } else if (name === 'NotAllowedError' && kind === 'webcam') {
          handleError('filePicker.permissionDenied', 'Permission denied.');
        }
        handleClose();
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [kind, stopStream]);

  // Release preview object URL
  useEffect(() => {
    return () => {
      if (shot?.url) URL.revokeObjectURL(shot.url);
    };
  }, [shot]);

  const takeShot = () => {
    const video = videoRef.current;
    if (!video || !kind || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (kind === 'webcam') {
      // Mirror horizontally so the result matches the (mirrored) live preview
      ctx?.translate(canvas.width, 0);
      ctx?.scale(-1, 1);
    }
    ctx?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const prefix = kind === 'webcam' ? 'webcam' : 'screen';
        const file = new File([blob], `${prefix}-${timestamp()}.png`, { type: 'image/png' });
        setShot({ file, url: URL.createObjectURL(file) });
      }
    }, 'image/png');
  };

  const confirmShot = () => {
    if (shot && kind) onCapture(shot.file, kind);
    onClose();
  };

  return (
    <Modal
      open={!!kind}
      onCancel={onClose}
      // destroyOnHidden
      centered
      width={720}
      title={
        kind === 'webcam'
          ? t('filePicker.webcam', 'Take a photo')
          : t('filePicker.screenCapture', 'Capture screen')
      }
      afterClose={stopStream}
      footer={
        shot ? (
          <Flex gap={8} justify="flex-end">
            <Button onClick={() => setShot(null)}>
              {t('filePicker.retake', 'Retake')}
            </Button>
            <Button type="primary" onClick={confirmShot}>
              {t('filePicker.use', 'Use')}
            </Button>
          </Flex>
        ) : (
          <Flex gap={8} justify="flex-end">
            <Button onClick={onClose}>{t('buttons.cancel', 'Cancel')}</Button>
            <Button type="primary" onClick={takeShot}>
              {t('filePicker.capture', 'Capture')}
            </Button>
          </Flex>
        )
      }
    >
      {/* Video stays mounted (hidden) during review so the stream is not restarted on "Retake". */}
      <video
        ref={setVideoEl}
        autoPlay
        playsInline
        muted
        disablePictureInPicture
        hidden={!!shot}
        className={(kind === 'webcam' ? 'mirror ' : '') + videoclassName}
        onContextMenu={evt => evt.preventDefault()}
      />
      {shot && <img src={shot.url} alt="" className={videoclassName} />}
    </Modal>
  );
};

type UrlModalProps = {
  open: boolean;
  onClose: () => void;
  onFile: (file: File) => void;
} & Pick<UrlToFileOptions, 'accept' | 'maxBytes' | 'timeout' | 'fetchUrl'>;

const UrlModal = ({ open, onClose, onFile, ...options }: UrlModalProps) => {
  const t = useTranslate();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Abort a running fetch on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  const describe = (err: unknown) => {
    const code: UrlErrorCode = err instanceof UrlError ? err.code : 'network';
    switch (code) {
      case 'invalid':
        return t('filePicker.urlInvalid', 'Enter a valid URL, e.g. https://example.com/image.png');
      case 'protocol':
        return t('filePicker.urlProtocol', 'Only http:// and https:// links are supported.');
      case 'http': {
        const status = err instanceof UrlError ? err.status : undefined;
        return t('filePicker.urlHttp', { status }, `The server responded with an error (${status}).`);
      }
      case 'timeout':
        return t('filePicker.urlTimeout', 'The request took too long.');
      case 'type':
        return t('filePicker.notAccepted', 'This file type is not accepted.');
      case 'size':
        return options.maxBytes
          ? t('filePicker.urlTooLarge', { max: formatBytes(options.maxBytes) }, `The file exceeds ${formatBytes(options.maxBytes)}.`)
          : t('filePicker.urlTooLargeNoMax', 'The file is too large.');
      default:
        return t(
          'filePicker.urlNetwork',
          'Unable to download the file. The server may block requests from this site (CORS) or the link is unreachable.'
        );
    }
  };

  const close = () => {
    abortRef.current?.abort();
    onClose();
  };

  const submit = async () => {
    const url = value.trim();
    if (!url || loading) return;

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const file = await urlToFile(url, { ...options, signal: ctrl.signal });
      onFile(file);
      onClose();
    } catch (err) {
      if (!ctrl.signal.aborted) setError(describe(err)); // aborted = user cancelled
    } finally {
      if (abortRef.current === ctrl) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      centered
      title={t('filePicker.fromUrl', 'From URL')}
      afterClose={() => {
        setValue('');
        setError(null);
        setLoading(false);
      }}
      footer={
        <Flex gap={8} justify="flex-end">
          <Button onClick={close}>{t('buttons.cancel', 'Cancel')}</Button>
          <Button type="primary" loading={loading} disabled={!value.trim()} onClick={submit}>
            {t('filePicker.fetch', 'Add')}
          </Button>
        </Flex>
      }
    >
      <Input
        type="url"
        autoFocus
        allowClear
        inputMode="url"
        value={value}
        disabled={loading}
        status={error ? 'error' : undefined}
        placeholder={t('filePicker.urlPlaceholder', 'https://example.com/image.png')}
        aria-label={t('filePicker.fromUrl', 'From URL')}
        aria-invalid={!!error}
        onChange={(evt) => {
          setValue(evt.target.value);
          if (error) setError(null);
        }}
        onPressEnter={submit}
      />
      <div role="alert" className="mt-2 text-red-500 empty:hidden">
        {error}
      </div>
    </Modal>
  );
};

/**
 * Thin wrapper around antd `Upload.Dragger`.
 * Supports every `Upload` prop, plus `maxBytes`, `webcam`, `screenCapture`, `renderExtra` and `hint`.
 * Paste is antd's own `pastable` prop.
 */
export const FilePicker = ({
  maxBytes,
  webcam,
  screenCapture,
  pasteUrl,
  fetchUrl,
  urlTimeout,
  renderExtra,
  hint,
  children,
  beforeUpload,
  pastable,
  accept,
  disabled,
  ...etc
}: FilePickerProps) => {
  const t = useTranslate();
  const [messageApi, messageHolder] = message.useMessage();
  const rootRef = useRef<HTMLDivElement>(null);
  const [capture, setCapture] = useState<CaptureKind | null>(null);
  const [urlOpen, setUrlOpen] = useState(false);

  const canWebcam = useMemo(() => !!webcam && supportsWebcam(), [webcam]);
  const canScreen = useMemo(() => !!screenCapture && supportsScreen(), [screenCapture]);

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file, fileList) => {
    let next: File = file;

    // Pasted screenshots are named "image.png"; give them a unique name.
    if (pastable && GENERIC_PASTE_NAMES.has(file.name) && file.type.startsWith('image/')) {
      const ext = file.name.split('.').pop();
      next = new File([file], `pasted-${timestamp()}.${ext}`, { type: file.type });
      // keep antd's uid so the list entry stays consistent
      (next as File & { uid?: string }).uid = (file as File & { uid?: string }).uid;
    }

    if (maxBytes && next.size > maxBytes) {
      messageApi.error(
        t('filePicker.tooLarge', { name: next.name, max: formatBytes(maxBytes) }, `${next.name} exceeds ${formatBytes(maxBytes)}.`)
      );
      return Upload.LIST_IGNORE;
    }

    if (beforeUpload) {
      const result = beforeUpload(next as typeof file, fileList);
      return result;
    }
    return next as typeof file;
  };

  /**
   * Feeds a file (webcam, screen capture, URL) into antd's own pipeline by setting it on the hidden
   * <input type="file">, so accept / maxCount / beforeUpload / action / onChange all behave as usual.
   */
  const addFile = (file: File) => {
    if (!matchesAccept(file, accept)) {
      messageApi.error(t('filePicker.notAccepted', 'This file type is not accepted.'));
      return;
    }
    const input = rootRef.current?.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  return (
    <div ref={rootRef}>
      <Upload.Dragger
        {...etc}
        accept={accept}
        disabled={disabled}
        pastable={pastable && !disabled}
        beforeUpload={handleBeforeUpload}
      >
        {children ?? (
          <>
            <InboxOutlined style={{ fontSize: 55 }} />
            <p className="ant-upload-text my-2">
              {t('filePicker.text', 'Click or drag files to this area')}
              {pastable && !disabled ? ` ${t('filePicker.orPaste', 'or paste')}` : ''}
            </p>
            {(hint || maxBytes) && (
              <div>
                {hint ?? t('filePicker.maxSize', { max: formatBytes(maxBytes!) }, `Max size ${formatBytes(maxBytes!)} per file`)}
              </div>
            )}
          </>
        )}
      </Upload.Dragger>

      {(canWebcam || canScreen || pasteUrl || renderExtra) && (
        <Flex gap={4} wrap style={{ marginTop: 8 }}>
          {canWebcam && (
            <Button 
              icon={<CameraOutlined />} 
              disabled={disabled} 
              onClick={() => setCapture('webcam')} 
            >
              {t('filePicker.webcam', 'Take a photo')}
            </Button>
          )}
          {canScreen && (
            <Button 
              icon={<DesktopOutlined />} 
              disabled={disabled} 
              onClick={() => setCapture('screen')} 
            >
              {t('filePicker.screenCapture', 'Capture screen')}
            </Button>
          )}
          {pasteUrl && (
            <Button
              icon={<LinkOutlined />}
              disabled={disabled}
              onClick={() => setUrlOpen(true)}
            >
              {t('filePicker.fromUrl', 'From URL')}
            </Button>
          )}
          {renderExtra?.()}
        </Flex>
      )}

      {pasteUrl && (
        <UrlModal
          open={urlOpen}
          onClose={() => setUrlOpen(false)}
          onFile={addFile}
          accept={accept}
          maxBytes={maxBytes}
          timeout={urlTimeout}
          fetchUrl={fetchUrl}
        />
      )}

      {(canWebcam || canScreen) && (
        <CaptureModal 
          msg={messageApi}
          kind={capture} 
          onClose={() => setCapture(null)} 
          onCapture={addFile} 
        />
      )}

      {messageHolder}
    </div>
  );
};

export default FilePicker;
