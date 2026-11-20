import type { UploadProps } from 'antd';
import { EXT_BY_MIME, MIME_BY_EXT } from './data';
import type { FetchedBlob, UrlErrorCode, UrlToFileOptions } from './types';

export const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

/** Seconds → "mm:ss", or "hh:mm:ss" once it reaches an hour. */
export const formatDuration = (totalSeconds: number) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/** Minimal `accept` matcher: ".pdf", "image/*", "application/json". */
export const matchesAccept = (file: File, accept?: UploadProps['accept']) => {
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

export const supportsWebcam = () =>
  window.isSecureContext &&
  !!navigator.mediaDevices?.getUserMedia;

export const supportsScreen = () =>
  window.isSecureContext &&
  !!navigator.mediaDevices?.getDisplayMedia;

export const supportsRecord = () => typeof MediaRecorder !== 'undefined';

/* ------------------------------ URL -> File ------------------------------ */

export class UrlError extends Error {
  code: UrlErrorCode;
  status?: number;
  constructor(code: UrlErrorCode, status?: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

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

const defaultFetch = async (
  url: string,
  signal: AbortSignal
): Promise<FetchedBlob> => {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new UrlError('http', res.status);

  return {
    blob: await res.blob(),
    name: filenameFromDisposition(res.headers.get('content-disposition')),
  };
};

/** Fetches a URL and converts the response to a `File`. Throws `UrlError`. */
export const urlToFile = async (
  rawUrl: string,
  { signal, accept, timeout = 15000, fetchUrl }: UrlToFileOptions
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
      : await defaultFetch(url.href, ctrl.signal);
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
