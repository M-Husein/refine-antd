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
  <ImageControl pasteUrl webcam multiple />
</Space>
```

| Prop | Description |
| --- | --- |
| FilePicker props | `pasteUrl`, `webcam`, `screenCapture`, `fetchUrl`, `urlTimeout`, `multiple`, `maxCount`, `accept` (default `image/*`), `pastable` (default `true`), `action`, `customRequest`, `beforeUpload`, `onChange`, `listType`, `hint`, `renderExtra`, ... |
| `getUrl(file)` | Turns an uploaded `UploadFile` into the image `src`. Default: the response when it is a string, else `response.url` / `response.data.url`, else `file.url`. |
| `modalTitle`, `modalProps` | Title and extra props of the antd Modal. |
| Button props | `icon`, `size`, `type`, `disabled`, `className`, ... go to the trigger button. A name shared with the FilePicker (`disabled`, `className`, `style`, `type`, `children`) keeps its **button** meaning; `name` and `onChange` go to the picker. `disabled` applies to both. |

Where the image comes from:
- **No `action` / `customRequest`:** the image is embedded as a **data URL** (base64). Simple, but the content grows by about 33% of the file size, so validate the size in `beforeUpload` or upload instead.
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

## Future features

> Planned / optional. **Not implemented**, so the details below may change.

### Image width stored as a number (percent)

Today the image `width` attribute is a CSS string (`"50%"`, `"480px"`), and the resize handles, the size presets, the Slider and the "Custom Width" input each write it in their own way. The idea is to store **one number, a percentage from 1 to 100**, and build the CSS string only when rendering.

Why:
- The Slider and the InputNumber bind to the attribute directly, with no `parseFloat` / `formatter` / `parser`.
- Only one validation is needed (an integer from 1 to 100). A number cannot carry CSS, so a document can no longer smuggle `50%; position:fixed` or `50%" onerror=...` into the HTML/Markdown `style` attribute.
- HTML and Markdown output is always valid (`width: 50%`), and unitless values such as `"480"` stop being lost.

Design notes:
- **Old data.** Before this change `width` was a number of **pixels** (`width: 480`, `width="480"`), so `480` would suddenly mean 480%. Reads must go through one tolerant helper, used by `ImageFigure`, `renderHTML` and `markdown.ts` (Tiptap does not run `parseHTML` when it loads JSON, so the render side must normalize too):
  ```ts
  toPercent(value): number | null
  // number 1..100     -> value (rounded)
  // "50%"             -> 50
  // px, > 100, NaN    -> null  (natural size, nothing breaks)
  ```
  A px width cannot be converted to a percentage without knowing the container width, so it falls back to the natural size. Document this in the migration notes.
- **Single conversion point.** `` width ? `${toPercent(width)}%` : "fit-content" `` only in the renderers; every writer (handles, presets, Slider, InputNumber) stores the integer.
- **Attribute name.** Either keep `width` and document that it holds a percentage, or rename it to `widthPercent`. A rename removes the ambiguity with old pixel values but is a bigger migration.
- **Always round.** Store integers, to avoid values such as `33.3333`.
- **Slider.** `onChange` fires on every move and creates one transaction per move (like the resize handles). Keep a local value for the live preview and save it in `onChangeComplete`; show the value with `` tooltip={{ formatter: (v) => `${v}%` }} ``.
- **Limit.** A maximum of 100 means an image can never be wider than its container. This is intended.

## Structure

```
RichText/
  Editor/    this component (Editor, Content, Context, controls/, nodeviews/, preset.ts)
  Viewer/    read-only renderer
  core/      shared by both: content/ (json, html, markdown), extensions/, nodes/, renderer/, types
  styles/    content.css, editor.css, viewer.css
```

`Viewer` must never import editor-only code (`@tiptap/react`, ProseMirror state/view, `mathlive`, CodeMirror); keep editing code under `core/nodes/*/editor` and `Editor/`.
