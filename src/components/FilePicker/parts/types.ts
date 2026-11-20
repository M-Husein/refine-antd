import type { ReactNode, Ref } from 'react';
import type { UploadProps, UploadRef } from 'antd';

export type FilePickerProps = Omit<UploadProps, 'children'> & {
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

export type CaptureKind = 'webcam' | 'screen' | 'webcamRecord' | 'screenRecord';

export type UrlErrorCode = 'invalid' | 'protocol' | 'network' | 'http' | 'timeout' | 'type' | 'aborted';

export type FetchedBlob = { blob: Blob; name?: string };

export type UrlToFileOptions = {
  signal?: AbortSignal;
  accept?: UploadProps['accept'];
  timeout?: number;
  fetchUrl?: FilePickerProps['fetchUrl'];
};
