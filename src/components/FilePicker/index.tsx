import { useMemo, useRef, useState } from 'react';
import { message, Button, Flex, Upload } from 'antd';
import type { UploadProps } from 'antd';
import {
  CameraOutlined,
  DesktopOutlined,
  InboxOutlined,
  LinkOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useTranslate } from '@refinedev/core';
import { CaptureModal } from './parts/CaptureModal';
import { UrlModal } from './parts/UrlModal';
import { GENERIC_PASTE_NAMES } from './parts/data';
import { matchesAccept, supportsRecord, supportsScreen, supportsWebcam, timestamp } from './parts/utils';
import type { CaptureKind, FilePickerProps } from './parts/types';

export type { FilePickerProps } from './parts/types';

export const FilePicker = ({
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
            {hint && <div>{hint}</div>}
          </>
        )}
      </Upload.Dragger>

      {(canWebcam || canScreen || canWebcamRecord || canScreenRecord || pasteUrl || renderExtra) && (
        <Flex gap={4} wrap style={{ marginTop: 8 }}>
          {pasteUrl && (
            <Button
              icon={<LinkOutlined />}
              disabled={disabled}
              onClick={() => setUrlOpen(true)}
            >
              {t('filePicker.fromUrl', 'From URL')}
            </Button>
          )}
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
          {renderExtra?.()}
        </Flex>
      )}

      {pasteUrl && (
        <UrlModal
          open={urlOpen}
          onClose={() => setUrlOpen(false)}
          onFile={addFile}
          accept={accept}
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
