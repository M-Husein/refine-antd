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
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useTranslate } from '@refinedev/core';

export type FilePickerProps = Omit<UploadProps, 'children'> & {
  /** Maximum size per file, in bytes. Larger files are rejected. */
  maxBytes?: number;
  /** Show the webcam (selfie) button. Hidden if the browser does not support it. */
  webcam?: boolean;
  /** Show the screen capture button. Hidden if the browser does not support it. */
  screenCapture?: boolean;
  /** Show the webcam video record button. Hidden if the browser does not support it. */
  webcamRecord?: boolean;
  /** Show the screen video record button. Hidden if the browser does not support it. */
  screenRecord?: boolean;
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

type CaptureKind = 'webcam' | 'screen' | 'webcamRecord' | 'screenRecord';

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
  window.isSecureContext &&
  !!navigator.mediaDevices?.getUserMedia;

const supportsScreen = () =>
  window.isSecureContext &&
  !!navigator.mediaDevices?.getDisplayMedia;

const supportsRecord = () => typeof MediaRecorder !== 'undefined';

/** Tried in order; the first one the browser supports is used (Safari: mp4). */
const RECORD_MIME_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
];

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
    throw new UrlError('network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }

  const { blob } = fetched;
  if (maxBytes && blob.size > maxBytes) throw new UrlError('size');

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const stopDrawRef = useRef<(() => void) | null>(null); // stops the mirroring canvas loop (webcamRecord)
  const chunksRef = useRef<Blob[]>([]);
  const [shot, setShot] = useState<{ file: File; url: string } | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<{ file: File; url: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null); // 3 → 2 → 1 before a recording starts
  const countdownTimerRef = useRef<number | null>(null);

  const handleClose = useEffectEvent(() => onClose());
  const handleError = useEffectEvent((key: string, fallback: string) => msg.error(t(key, fallback)));
  const handleWarn = useEffectEvent((key: string, fallback: string) => msg.warning(t(key, fallback)));

  // The user stopped sharing from the browser UI: finish a running recording instead of losing it.
  const handleEnded = useEffectEvent(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') recorder.stop();
    else onClose();
  });

  // Drops the recorder without producing a file (modal closed / unmounted).
  const discardRecorder = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      // stop() throws InvalidStateError on an inactive recorder
      if (recorder.state !== 'inactive') recorder.stop();
    }
    stopDrawRef.current?.();
    stopDrawRef.current = null;
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  }, []);

  const stopStream = useCallback(() => {
    clearCountdown();
    discardRecorder();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [clearCountdown, discardRecorder]);

  const setVideoEl = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current && el.srcObject !== streamRef.current) {
      el.srcObject = streamRef.current;
    }
  }, []);

  useEffect(() => {
    if (!kind) return;
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- reset the review state each time the modal opens */
    setShot(null);
    setRecordedVideo(null);
    setIsRecording(false);
    setIsVideoReady(false);
    setCountdown(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const getWebcam = (audio: boolean) =>
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio });

        let stream: MediaStream;
        if (kind === 'webcam') {
          stream = await getWebcam(false);
        } else if (kind === 'webcamRecord') {
          try {
            stream = await getWebcam(true);
          } catch (err) {
            // No microphone: record without sound instead of failing completely
            if (cancelled || (err as DOMException)?.name !== 'NotFoundError') throw err;
            stream = await getWebcam(false);
            if (!cancelled) handleWarn('filePicker.noMicrophone', 'No microphone found, recording without sound.');
          }
        } else {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: kind === 'screenRecord',
          });
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        stream.getVideoTracks()[0]?.addEventListener('ended', () => handleEnded());
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        if (cancelled) return;
        const name = (err as DOMException)?.name;
        if (name !== 'AbortError' && name !== 'NotAllowedError') {
          handleError('filePicker.captureFailed', 'Unable to access the device.');
        } else if (name === 'NotAllowedError' && (kind === 'webcam' || kind === 'webcamRecord')) {
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

  useEffect(() => {
    return () => {
      if (shot?.url) URL.revokeObjectURL(shot.url);
      if (recordedVideo?.url) URL.revokeObjectURL(recordedVideo.url);
    };
  }, [shot, recordedVideo]);

  const startRecording = () => {
    const video = videoRef.current;
    const source = streamRef.current;
    if (!video || !source || !kind) return;
    chunksRef.current = [];

    let recordStream: MediaStream = source;

    if (kind === 'webcamRecord') {
      // Mirror the RECORDED FILE (not just the preview): draw every frame flipped on a canvas
      // and record the canvas stream, plus the original audio.
      const width = video.videoWidth;
      const height = video.videoHeight;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx || !width || !height) {
        msg.error(t('filePicker.captureFailed', 'Unable to access the device.'));
        return;
      }

      let raf = 0;
      const draw = () => {
        ctx.setTransform(-1, 0, 0, 1, width, 0); // horizontal flip
        ctx.drawImage(video, 0, 0, width, height);
        raf = requestAnimationFrame(draw);
      };
      draw();

      const mirrored = canvas.captureStream(30);
      source.getAudioTracks().forEach((track) => mirrored.addTrack(track));
      recordStream = mirrored;
      // Only stop the canvas video track: the audio track is shared with the live stream (needed for "Retake").
      stopDrawRef.current = () => {
        cancelAnimationFrame(raf);
        mirrored.getVideoTracks().forEach((track) => track.stop());
      };
    }

    const mimeType = RECORD_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(recordStream, mimeType ? { mimeType } : undefined);
    } catch {
      stopDrawRef.current?.();
      stopDrawRef.current = null;
      msg.error(t('filePicker.recordNotSupported', 'Recording is not supported by this browser.'));
      return;
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      stopDrawRef.current?.();
      stopDrawRef.current = null;

      const type = (recorder.mimeType || mimeType || 'video/webm').split(';')[0];
      const ext = type === 'video/mp4' ? 'mp4' : 'webm';
      const prefix = kind === 'webcamRecord' ? 'webcam' : 'screen';
      const blob = new Blob(chunksRef.current, { type });
      const file = new File([blob], `${prefix}-record-${timestamp()}.${ext}`, { type });
      setRecordedVideo({ file, url: URL.createObjectURL(file) });
      setIsRecording(false);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  // Webcam and screen recordings start after a 3-2-1 countdown (like the Windows 11 Snipping Tool).
  const beginRecording = () => {
    if (countdownTimerRef.current !== null) return;

    let remaining = 3;
    setCountdown(remaining);
    countdownTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setCountdown(remaining);
      } else {
        clearCountdown();
        startRecording();
      }
    }, 1000);
  };

  const retakeVideo = () => {
    // The user stopped sharing (screen) while recording: the stream is dead, nothing to retake from.
    if (streamRef.current?.getVideoTracks()[0]?.readyState === 'ended') {
      onClose();
      return;
    }
    if (recordedVideo?.url) URL.revokeObjectURL(recordedVideo.url);
    setRecordedVideo(null);
    setIsVideoReady(false);
  };

  const retakeShot = () => {
    if (shot?.url) URL.revokeObjectURL(shot.url);
    setShot(null);
    setIsVideoReady(false);
  };

  const confirmVideo = () => {
    if (recordedVideo && kind) onCapture(recordedVideo.file, kind);
    onClose();
  };

  const confirmShot = () => {
    if (shot && kind) onCapture(shot.file, kind);
    onClose();
  };

  const takeShot = () => {
    const video = videoRef.current;
    if (!video || !kind) {
      msg.error('Video element not ready.');
      return;
    }

    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 480;

    if (width === 0 || height === 0) {
      msg.error('Video dimensions are not available. Please wait a moment and try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (kind === 'webcam' || kind === 'webcamRecord') {
      ctx?.translate(canvas.width, 0);
      ctx?.scale(-1, 1);
    }
    
    try {
      ctx?.drawImage(video, 0, 0, width, height);
    } catch (e) {
      console.error("Failed to draw video to canvas", e);
      msg.error("Failed to capture image. Please try again.");
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const prefix = kind.includes('webcam') ? 'webcam' : 'screen';
        const file = new File([blob], `${prefix}-${timestamp()}.png`, { type: 'image/png' });
        setShot({ file, url: URL.createObjectURL(file) });
      } else {
        msg.error('Failed to generate image blob.');
      }
    }, 'image/png');
  };

  return (
    <Modal
      open={!!kind}
      onCancel={onClose}
      centered
      width={720}
      title={
        kind === 'webcam'
          ? t('filePicker.webcam', 'Take a photo')
          : kind === 'webcamRecord'
          ? t('filePicker.webcamRecord', 'Record Video')
          : kind === 'screen'
          ? t('filePicker.screenCapture', 'Capture screen')
          : t('filePicker.screenRecord', 'Record Screen')
      }
      afterClose={stopStream}
      footer={
        recordedVideo || shot ? (
          <Flex gap={8} justify="flex-end">
            <Button onClick={recordedVideo ? retakeVideo : retakeShot}>
              {t('filePicker.retake', 'Retake')}
            </Button>
            <Button type="primary" onClick={recordedVideo ? confirmVideo : confirmShot}>
              {t('filePicker.use', 'Use')}
            </Button>
          </Flex>
        ) : countdown !== null ? (
          <Flex gap={8} justify="flex-end">
            <Button onClick={clearCountdown}>{t('buttons.cancel', 'Cancel')}</Button>
          </Flex>
        ) : isRecording ? (
          <Flex gap={8} justify="flex-end">
            <Button danger onClick={stopRecording}>
              {t('filePicker.stopRecording', 'Stop Recording')}
            </Button>
          </Flex>
        ) : (
          <Flex gap={8} justify="flex-end">
            <Button onClick={onClose}>{t('buttons.cancel', 'Cancel')}</Button>
            {kind === 'webcam' || kind === 'screen' ? (
              <Button type="primary" onClick={takeShot} disabled={!isVideoReady}>
                {t('filePicker.capture', 'Capture')}
              </Button>
            ) : (
              <Button type="primary" onClick={beginRecording} disabled={!isVideoReady}>
                {t('filePicker.startRecording', 'Start Recording')}
              </Button>
            )}
          </Flex>
        )
      }
    >
      {!recordedVideo && !shot && (
        <video
          ref={setVideoEl}
          autoPlay
          playsInline
          muted
          disablePictureInPicture
          className={(kind === 'webcam' || kind === 'webcamRecord' ? 'mirror ' : '') + videoclassName}
          onContextMenu={evt => evt.preventDefault()}
          onLoadedData={() => setIsVideoReady(true)}
        />
      )}
      {recordedVideo && (
        <video
          autoPlay
          playsInline
          controls
          disablePictureInPicture
          src={recordedVideo.url}
          // No "mirror" class: a webcam recording is already mirrored inside the file itself
          className={videoclassName}
        />
      )}
      {shot && <img src={shot.url} alt="" className={videoclassName} />}

      {countdown !== null && (
        <div
          key={countdown}
          role="timer"
          aria-live="assertive"
          className="fixed inset-0 grid place-content-center text-center bg-black/40 text-white font-bold pointer-events-none"
          style={{ 
            zIndex: 1056, 
            fontSize: 80, 
            textShadow: '0 2px 16px rgb(0 0 0 / 60%)' 
          }}
        >
          {countdown}
          <Button 
            size="large" 
            className="pointer-events-auto"
            onClick={clearCountdown}
          >
            {t('buttons.cancel', 'Cancel')}
          </Button>
        </div>
      )}
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
      if (!ctrl.signal.aborted) setError(describe(err));
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
        // aria-invalid={!!error}
        onChange={(evt) => {
          setValue(evt.target.value);
          if (error) setError(null);
        }}
        onPressEnter={submit}
      />
      {!!error && (
        <div role="alert" className="mt-1 text-red-700 text-xs">
          {error}
        </div>
      )}
    </Modal>
  );
};

export const FilePicker = ({
  maxBytes,
  webcam,
  screenCapture,
  webcamRecord,
  screenRecord,
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
  const canWebcamRecord = useMemo(() => !!webcamRecord && supportsWebcam() && supportsRecord(), [webcamRecord]);
  const canScreenRecord = useMemo(() => !!screenRecord && supportsScreen() && supportsRecord(), [screenRecord]);

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file, fileList) => {
    let next: File = file;

    if (pastable && GENERIC_PASTE_NAMES.has(file.name) && file.type.startsWith('image/')) {
      const ext = file.name.split('.').pop();
      next = new File([file], `pasted-${timestamp()}.${ext}`, { type: file.type });
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

      {(canWebcam || canScreen || canWebcamRecord || canScreenRecord || pasteUrl || renderExtra) && (
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
          {canWebcamRecord && (
            <Button 
              icon={<VideoCameraOutlined />} 
              disabled={disabled} 
              onClick={() => setCapture('webcamRecord')} 
            >
              {t('filePicker.webcamRecord', 'Record Video')}
            </Button>
          )}
          {canScreenRecord && (
            <Button 
              icon={<VideoCameraOutlined />} 
              disabled={disabled} 
              onClick={() => setCapture('screenRecord')} 
            >
              {t('filePicker.screenRecord', 'Record Screen')}
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

      {(canWebcam || canScreen || canWebcamRecord || canScreenRecord) && (
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