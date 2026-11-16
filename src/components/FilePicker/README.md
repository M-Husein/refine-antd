# FilePicker

A thin wrapper around antd [`Upload.Dragger`](https://ant.design/components/upload). It keeps **every** `Upload` prop and behavior (drag & drop, `pastable`, `accept`, `maxCount`, `fileList`, `action`, `onChange`, ...) and adds:

- `maxBytes` – per-file size limit
- `webcam` – take a photo with the camera
- `screenCapture` – capture a screenshot of a screen/window/tab
- `pasteUrl` – add a file from a link ("From URL" button)
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
  pasteUrl
  onChange={({ fileList }) => setFiles(fileList)}
/>
```

Live demo: `/docs/components/file-picker` ([source](../../pages/docs/components/file-picker/Page.tsx)).

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
| `pasteUrl`      | `boolean`              | Show the "From URL" button: add a file by entering a link.                                            |
| `fetchUrl`      | `(url, signal) => Promise<Blob>` | Custom fetch for `pasteUrl`, e.g. through a backend proxy to get around CORS.               |
| `urlTimeout`    | `number`               | Timeout of the URL fetch in ms. Default `15000`.                                                      |
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

### From URL (`pasteUrl`)
- The **From URL** button opens a modal with an input. Press **Enter** or **Add** to fetch the link. **Cancel**/close aborts a running request.
- Flow: validate the URL (`http:`/`https:` only) → `fetch` with timeout (`urlTimeout`) → check `res.ok` → check `Content-Length` and the real size against `maxBytes` → check the type against `accept` → add as a `File`. It then goes through the normal antd pipeline (`accept`, `maxCount`, `beforeUpload`, `action`, `onChange`).
- File name: `Content-Disposition` header, else the last path segment of the URL, else `url-<timestamp>.<ext>`.
- File type: the response `Content-Type`. When the server sends none (or `application/octet-stream`), it is guessed from the file extension.
- Errors are shown inline in the modal: invalid URL, unsupported protocol, HTTP error (with status), timeout, type not accepted, too large, and network/CORS failure.
- **CORS:** a cross-origin `fetch` only works when the server sends `Access-Control-Allow-Origin`. Otherwise the browser blocks reading the response and you get the "network/CORS" error. To support any link, pass `fetchUrl` and go through your own backend:

```tsx
<FilePicker
  pasteUrl
  fetchUrl={async (url, signal) => {
    const res = await fetch(`/api/fetch-file?url=${encodeURIComponent(url)}`, { signal });
    if (!res.ok) throw new Error('proxy failed');
    return res.blob();
  }}
/>
```

If you add such a proxy, restrict schemes, block private/localhost IPs (SSRF), and limit size and timeout on the server.

An `http://` link cannot be fetched from an `https://` page (mixed content) and shows the same network error.

### Extra slot

```tsx
<FilePicker renderExtra={() => <Button onClick={openFileManager}>File Manager</Button>} />
```

## Translations

Uses refine's `useTranslate` with English defaults. Keys:

`filePicker.text`, `filePicker.orPaste`, `filePicker.maxSize` (`{{max}}`), `filePicker.tooLarge` (`{{name}}`, `{{max}}`), `filePicker.notAccepted`, `filePicker.webcam`, `filePicker.screenCapture`, `filePicker.capture`, `filePicker.retake`, `filePicker.use`, `filePicker.captureFailed`, `filePicker.permissionDenied`, `buttons.cancel`.

From URL: `filePicker.fromUrl`, `filePicker.fetch`, `filePicker.urlPlaceholder`, `filePicker.urlInvalid`, `filePicker.urlProtocol`, `filePicker.urlHttp` (`{{status}}`), `filePicker.urlTimeout`, `filePicker.urlTooLarge` (`{{max}}`), `filePicker.urlTooLargeNoMax`, `filePicker.urlNetwork`.

## Notes

- `disabled` turns off the drop area, `pastable`, and every button (Take a photo, Capture screen, From URL).
- `<timestamp>` in generated file names is an ISO date with `:` and `.` replaced by `-`, e.g. `webcam-2026-11-16T10-20-30-123Z.png`.
- Error and info messages use antd `message` (via `message.useMessage()`), so the component does not need to be inside antd `<App>`.
- Not implemented yet: see [Future features](#future-features).

## Future features

> Planned / optional. **Not implemented**, so the API below may change.

### Global paste of URLs (phase 2 of `pasteUrl`)

`pasteUrl` currently works only through the "From URL" button. A global text `paste` listener (paste a link anywhere on the page) is **not implemented**. It would need a `document.activeElement` guard (`input`, `textarea`, `select`, `contenteditable`), because pasting text into inputs is normal, unlike file paste (`pastable`), which only calls `preventDefault()` when the clipboard contains files. Only one FilePicker per page should react to it.

### Other ideas
- File Manager integration via `renderExtra`.
- Google Drive integration via `renderExtra`.
