export const GENERIC_PASTE_NAMES = new Set(['image.png', 'image.jpg', 'image.jpeg', 'image.gif', 'image.webp']);

/** Tried in order; the first one the browser supports is used (Safari: mp4). */
export const RECORD_MIME_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
];

export const MIME_BY_EXT: Record<string, string> = {
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

export const EXT_BY_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(MIME_BY_EXT)
    .filter(([ext]) => ext !== 'jpeg')
    .map(([ext, mime]) => [mime, ext])
);
