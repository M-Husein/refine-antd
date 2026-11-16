# RichText / Editor

Rich text editor built on [Tiptap](https://tiptap.dev) + Ant Design. The canonical document is Tiptap JSON; HTML and Markdown are representations of it (`format` prop). Pair it with [`Viewer`](../Viewer/README.md) to display the content read-only.

```tsx
import { Editor, Content, Bold, Italic, createEditorExtensions } from '@/components/RichText/Editor';
```

> The toolbar is **not** shipped: the controls (`Bold`, `Link`, ...) are separate components and you decide the layout. `Content` is the editable surface.

## Usage

```tsx
const extensions = createEditorExtensions(); // module constant or useMemo — NOT inline

const [value, setValue] = useState<string | JSONContent>('<p>Hello</p>');

<Editor value={value} format="html" onChange={setValue} extensions={extensions} placeholder="Start typing...">
  <Space.Compact>
    <Bold />
    <Italic />
  </Space.Compact>
  <Content />
</Editor>
```

Inside a form (`value`/`onChange` are what `Form.Item` injects):

```tsx
<Form.Item name="body">
  <Editor format="markdown" extensions={extensions}>
    <Bold />
    <Content />
  </Editor>
</Form.Item>
```

## Props

`EditorProps`

| Prop          | Type                             | Description                                                                                |
| ------------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| `value`       | `string \| JSONContent`          | Controlled value. Its shape depends on `format`.                                           |
| `format`      | `'json' \| 'html' \| 'markdown'` | Format of `value` / `onChange`. Default `json`.                                            |
| `onChange`    | `(value) => void`                | Called with a value in the same `format`.                                                  |
| `readOnly`    | `boolean`                        | Locks the editor. For a real read-only display use `Viewer`.                               |
| `placeholder` | `string`                         | Shown when the document is empty.                                                          |
| `extensions`  | `AnyExtension[]`                 | Extra Tiptap extensions (table, image, ...). A same-named extension replaces the core one. |
| `className`   | `string`                         | Class of the root element.                                                                 |
| `children`    | `ReactNode`                      | Controls + `<Content />`.                                                                  |

`createEditorExtensions({ allowedCustomOrigins })` enables table, image, video, audio, embed, math and code block (CodeMirror 6) with their editing UI.

## Controls

`Bold`, `Italic`, `Underline`, `Strikethrough`, `Heading`, `BulletList`, `OrderedList`, `Checklist`, `CodeBlockControl`, `Link`, `TableControl`, `TableToolbar`, `ImageControl`, `VideoControl`, `AudioControl`, `EmbedControl`, `MathControl`, `Undo`, `Redo`, `FindAndReplace`.

Controls need the matching extension, e.g. `ImageControl` needs the image extension from `createEditorExtensions()`. They render nothing outside `<Editor>`. `useRichTextEditor()` returns the live Tiptap editor for your own controls.

### ImageControl

Opens a modal with a [`FilePicker`](../../FilePicker/README.md): pick, drop or paste an image, or add one from a URL, the camera or the screen. The FilePicker props are passed straight through, so the picker is configured on the control itself:

```tsx
<Space>
  <ImageControl pasteUrl webcam multiple maxBytes={2 * 1024 * 1024} />
</Space>
```

| Prop | Description |
| --- | --- |
| FilePicker props | `pasteUrl`, `webcam`, `screenCapture`, `fetchUrl`, `urlTimeout`, `maxBytes`, `multiple`, `maxCount`, `accept` (default `image/*`), `pastable` (default `true`), `action`, `customRequest`, `beforeUpload`, `onChange`, `listType`, `hint`, `renderExtra`, ... |
| `getUrl(file)` | Turns an uploaded `UploadFile` into the image `src`. Default: the response when it is a string, else `response.url` / `response.data.url`, else `file.url`. |
| `modalTitle`, `modalProps` | Title and extra props of the antd Modal. |
| Button props | `icon`, `size`, `type`, `disabled`, `className`, ... go to the trigger button. A name shared with the FilePicker (`disabled`, `className`, `style`, `type`, `children`) keeps its **button** meaning; `name` and `onChange` go to the picker. `disabled` applies to both. |

Where the image comes from:
- **No `action` / `customRequest`:** the image is embedded as a **data URL** (base64). Simple, but the content grows by about 33% of the file size, so set `maxBytes` or upload instead.
- **`action="/api/upload"`** (or `customRequest`): the file is uploaded and the URL is read from the response (`getUrl`).

Behavior: images of one batch are inserted together, in the order they were picked, once nothing is still uploading. An image is inserted **after** a currently selected image instead of replacing it. The modal closes when everything succeeded and stays open if a file failed, so the error remains visible. `src` values using `javascript:`, `vbscript:` or a non-image `data:` are rejected.

Needs the Refine context (the FilePicker uses `useTranslate`).

## Switching format

`value` and `format` must change together (json is an object, html/markdown are strings). Use `convertContent` to re-encode the current document with the full schema:

```tsx
import { convertContent } from '@/components/RichText/Editor';

const changeFormat = (next: ContentFormat) => {
  setValue(convertContent(value, format, next, extensions)); // same `extensions` as <Editor>
  setFormat(next);
};
```

Do not call `serializeContent`/`parseContent` with only your extra extensions: the schema would have no `doc` node. A JSON document passed while `format` is html/markdown is still read as JSON (never as the text "[object Object]").

## Embed security

Embeds only render YouTube and Vimeo by default. A `custom` provider only renders hostnames listed in `allowedCustomOrigins`; anything else is shown as a blocked placeholder, never an iframe. Use the **same** list in `createEditorExtensions` and `createViewerPreset`.

## Markdown

Markdown is serialized without losing information: constructs that Markdown cannot express (image alignment, table column widths, embeds, ...) fall back to inline HTML. Math is `$...$` / `$$...$$`.

## Known limitations

- **No i18n yet.** UI texts are hardcoded in English and are not yet routed through `useTranslate` (Refine). Affected: control tooltips and labels, Link/Image/Video/Audio/Embed/Math popovers (labels, placeholders, buttons), the ImageControl modal title (`Insert image`; the FilePicker inside is already translatable), table size picker and toolbar, code block header (`Code language`, `Code theme`, `Copy code`). To do: move them to the locale files.
- `createEditorExtensions()` (and `extensions` in general) must be a stable reference; a new array on each render rebuilds the editor.
- `readOnly` is a temporary lock, not a viewer.
- Uses the CSS classes `rte-*` (`../styles`); `mathlive/static.css` is imported by the component.
- `core/nodes/CodeBlock/languages.generated.ts` is generated from `@codemirror/language-data` (143 languages). Regenerate it if that package changes the list.

## Structure

```
RichText/
  Editor/    this component (Editor, Content, Context, controls/, nodeviews/, preset.ts)
  Viewer/    read-only renderer
  core/      shared by both: content/ (json, html, markdown), extensions/, nodes/, renderer/, types
  styles/    content.css, editor.css, viewer.css
```

`Viewer` must never import editor-only code (`@tiptap/react`, ProseMirror state/view, `mathlive`, CodeMirror); keep editing code under `core/nodes/*/editor` and `Editor/`.
