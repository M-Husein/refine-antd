# FilePicker

A thin wrapper around antd [`Upload.Dragger`](https://ant.design/components/upload). It keeps **every** `Upload` prop and behavior (drag & drop, `pastable`, `accept`, `maxCount`, `fileList`, `action`, `onChange`, ...) and adds:

- `maxBytes` – per-file size limit
- `webcam` – take a photo with the camera
- `screenCapture` – capture a screenshot of a screen/window/tab
- `renderExtra` – slot for future buttons (File Manager, Google Drive, ...)
- Pasted screenshots are renamed to `pasted-<timestamp>.png` instead of the generic `image.png`

```tsx
import { FilePicker } from '@/components/FilePicker';
```

## Usage

```tsx
<FilePicker
  multiple
  maxCount={5}
  accept="image/*,.pdf"
  maxBytes={5 * 1024 * 1024}
  pastable
  webcam
  screenCapture
  onChange={({ fileList }) => setFiles(fileList)}
/>
```

Inside a form (uploading is controlled by antd, so use `valuePropName`/`getValueFromEvent`):

```tsx
<Form.Item
  name="files"
  valuePropName="fileList"
  getValueFromEvent={(e) => e?.fileList}
>
  <FilePicker beforeUpload={() => false} accept="image/*" pastable webcam />
</Form.Item>
```

## Props

`FilePickerProps = Omit<UploadProps, 'children'> & { ... }`

| Prop            | Type                   | Description                                                                                           |
| --------------- | ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `maxBytes`      | `number`               | Max size per file in bytes. Larger files are rejected with an error message and not added to the list. |
| `webcam`        | `boolean`              | Show the "Take a photo" button. Auto-hidden if unsupported.                                           |
| `screenCapture` | `boolean`              | Show the "Capture screen" button. Auto-hidden if unsupported.                                         |
| `renderExtra`   | `() => ReactNode`      | Rendered next to the capture buttons.                                                                 |
| `hint`          | `ReactNode`            | Text under the main text of the drop area. Defaults to the max size when `maxBytes` is set.           |
| `children`      | `ReactNode`            | Replaces the default content of the drop area.                                                        |
| `pastable`      | `boolean` (antd)       | Paste files/images from the clipboard. Disabled automatically when `disabled`.                        |
| `ref`           | `Ref<UploadRef>`       | Ref of the underlying antd `Upload` (`nativeElement`, `upload`). React 19: a regular prop, no `forwardRef`. |
| ...rest         | `UploadProps` (antd)   | Everything else is passed to `Upload.Dragger`.                                                        |

### Ref

```tsx
import type { UploadRef } from 'antd';

const ref = useRef<UploadRef>(null);

<FilePicker ref={ref} />

ref.current?.nativeElement; // DOM element of the Upload
ref.current?.upload;        // rc-upload instance, e.g. .abort(file)
```

The ref points to the antd `Upload`, not to the wrapper `<div>` of `FilePicker`. Requires React 19 (`ref` as a prop).

## How it works

### Paste (`pastable`)
This is antd's own feature. antd registers a global `paste` listener on `document` and, **only when the clipboard contains files**, calls `preventDefault()`. Pasting plain text into inputs is therefore not affected, and no `document.activeElement` check is needed.

Things to keep in mind:
- Pasting an image into a `<textarea>`/rich-text editor on the same page will also be captured by the FilePicker.
- Only enable `pastable` on **one** FilePicker per page, otherwise the same file is added to all of them.
- If the FilePicker lives in a Modal/Drawer that is kept mounted, set `pastable={open}`.

### `maxBytes`
Checked inside `beforeUpload`. Your own `beforeUpload` is still called afterwards (with the possibly renamed file), so you can add further validation. Return `Upload.LIST_IGNORE` to reject a file.

The `pasted-<timestamp>` rename applies to any file named `image.png`/`image.jpg`/... while `pastable` is on. If your `beforeUpload` returns `false` (no upload), antd keeps the original file, so the rename is not applied.

### Webcam & screen capture
- Buttons appear only when `window.isSecureContext` (HTTPS or `localhost`) and `navigator.mediaDevices.getUserMedia` / `getDisplayMedia` exist.
- A modal shows the live preview. Press **Capture**, then **Use** or **Retake**.
- The result is a `File` (`webcam-<timestamp>.png` / `screen-<timestamp>.png`) that goes through the normal antd pipeline (`accept`, `maxCount`, `beforeUpload`, `action`, `onChange`), exactly like a file picked from disk.
- The webcam preview is mirrored (selfie view) and the saved photo is mirrored too, so it matches what you saw. Screen capture is never mirrored.
- The captured file is checked against `accept` before it enters the pipeline. If it does not match, an error is shown and nothing is added.
- If permission is denied (webcam) or the device cannot be opened, an error message is shown and the modal closes. Cancelling the screen picker closes the modal silently.
- The media stream is always stopped when the modal closes (including when it is closed while the browser is still asking for permission), so the camera/screen indicator turns off.

### Extra slot

```tsx
<FilePicker renderExtra={() => <Button onClick={openFileManager}>File Manager</Button>} />
```

## Translations

Uses refine's `useTranslate` with English defaults. Keys:

`filePicker.text`, `filePicker.orPaste`, `filePicker.maxSize` (`{{max}}`), `filePicker.tooLarge` (`{{name}}`, `{{max}}`), `filePicker.notAccepted`, `filePicker.webcam`, `filePicker.screenCapture`, `filePicker.capture`, `filePicker.retake`, `filePicker.use`, `filePicker.captureFailed`, `filePicker.permissionDenied`, `buttons.cancel`.

## Notes

- Not implemented yet: see [Future features](#future-features).

## Future features

> Planned / optional. **Not implemented**, so the API below may change.

### `pasteUrl` (add a file from a URL)

Let users add a file by entering or pasting a link. The file is fetched in the browser, converted to a `File`, and goes through the same antd pipeline as every other source (`accept`, `maxCount`, `beforeUpload`, `action`, `onChange`).

Proposed API:

```ts
pasteUrl?: boolean;                                                // show a "From URL" button
fetchUrl?: (url: string, signal: AbortSignal) => Promise<Blob>;    // custom fetch, e.g. via a backend proxy
urlTimeout?: number;                                               // default 15000 ms
```

Design notes:
- **Trigger:** a "From URL" button that opens a popover/modal with an input. A global text `paste` listener is optional (phase 2) and would need an `document.activeElement` guard (`input`, `textarea`, `select`, `contenteditable`), because pasting text into inputs is normal. File paste (`pastable`) does not need this guard.
- **Flow:** validate URL (`http:`/`https:` only) → `fetch` with `AbortController` + timeout → check `res.ok` → check `Content-Length` / `blob.size` against `maxBytes` → check `blob.type` against `accept` (fallback: URL extension) → build file name (`Content-Disposition`, URL path, or `url-<timestamp>.<ext>`) → add as `File`.
- **CORS:** cross-origin `fetch` fails when the server does not send `Access-Control-Allow-Origin`, and `no-cors` returns an unreadable opaque response. Use `fetchUrl` to go through a backend proxy.
- **Security:** if a server-side proxy is added, restrict schemes, block private/localhost IPs (SSRF), and limit size and timeout on the server. Never render fetched content as HTML.
- **Errors to handle:** invalid URL, unsupported protocol, CORS/network failure, HTTP 4xx/5xx, timeout, type not accepted, file too large, cancelled.

### Other ideas
- File Manager integration via `renderExtra`.
- Google Drive integration via `renderExtra`.
