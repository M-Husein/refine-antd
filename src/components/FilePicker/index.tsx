import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { message, Button, Flex, Modal, Upload } from 'antd';
import type { UploadProps, UploadRef } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import {
  CameraOutlined,
  DesktopOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useTranslate } from '@refinedev/core';

export type FilePickerProps = Omit<UploadProps, 'children'> & {
  /** Maximum size per file, in bytes. Larger files are rejected. */
  maxBytes?: number;
  /** Show the webcam (selfie) button. Hidden if the browser does not support it. */
  webcam?: boolean;
  /** Show the screen capture button. Hidden if the browser does not support it. */
  screenCapture?: boolean;
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

/**
 * Thin wrapper around antd `Upload.Dragger`.
 * Supports every `Upload` prop, plus `maxBytes`, `webcam`, `screenCapture`, `renderExtra` and `hint`.
 * Paste is antd's own `pastable` prop.
 */
export const FilePicker = ({
  maxBytes,
  webcam,
  screenCapture,
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
   * Feeds a captured file into antd's own pipeline by setting it on the hidden
   * <input type="file">, so accept / maxCount / beforeUpload / action / onChange all behave as usual.
   */
  const addCapturedFile = (file: File) => {
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

      {(canWebcam || canScreen || renderExtra) && (
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
          {renderExtra?.()}
        </Flex>
      )}

      {(canWebcam || canScreen) && (
        <CaptureModal 
          msg={messageApi}
          kind={capture} 
          onClose={() => setCapture(null)} 
          onCapture={addCapturedFile} 
        />
      )}

      {messageHolder}
    </div>
  );
};

export default FilePicker;
