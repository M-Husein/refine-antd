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

### Edit image

**Edit image** (the button on a selected image) opens a **modal in two columns**, like an image viewer: a **live preview on the left**, the form on the right. It has three tabs:

| Tab | Fields |
| --- | --- |
| Layout | Image Align, Display mode, Size Preset, **Width (all size)** |
| Responsive | the mode (Container / Viewport) and the ranges, see "Image responsive width" |
| Caption | Alt text, Caption, Caption Align |

How it behaves:
- **Live preview.** The preview renders the draft with the same figure component as the editor. The **XS / SM / MD / Large** switcher above it picks the range to preview (frames of 375, 640 and 768 px, Large = the whole pane) and shows the width that range really gets: its responsive value, else Width (all size). Gray placeholder lines make float and align visible.
- **Edits are staged.** Nothing reaches the document until **Save**. Save applies every change in **one transaction, so one Ctrl+Z undoes all of it**. **Cancel**, the close button and **Esc** discard the draft, and a modal you open again always starts from the image's current values. Save stays disabled while nothing differs from the start.
- **A click on the mask does nothing**, so a stray click never throws the staged edits away.
- Only the fields you changed are written, so an untouched field (for example a `480px` width that the form cannot show) is never rewritten.
- On screens narrower than 768px the preview sits on top of the form. The body scrolls by itself and the Save / Cancel footer is always visible, also on a laptop screen (about 650px high) and on a phone.
- Not yet: zoom and previous / next image navigation.

### Image width values

The image `width` can come from outside the editor too (stored JSON, pasted HTML, Markdown). It is read through one tolerant helper, `normalizeWidth` in `core/nodes/Image/size.ts`, used by the React renderer, the HTML serializer, the parsers and the Markdown serializer:

| Input | Result |
| --- | --- |
| `480`, `"480"` | `480px` (legacy pixel values) |
| `"50%"`, `"20rem"`, `"30vw"`, `"12.5px"` | unchanged (units: `px`, `%`, `rem`, `em`, `vw`, `vh`, `ch`) |
| `0`, negative, `NaN`, `"auto"`, `"fit-content"`, `"calc(...)"`, anything with `;` or quotes | ignored: the image keeps its natural size |

So a width can no longer end up as invalid CSS (the width silently disappearing) or smuggle extra CSS / attributes into the HTML and Markdown output. If you need another CSS value (for example `calc()`), it has to be added to the pattern in `size.ts`.

`captionAlign` (`left` by default, `center`, `right`) is kept in JSON, HTML and Markdown (written as `text-align` on the `<figcaption>`).

A future version may store the width as a percentage number (see "Future features").

### Image responsive width

Besides the normal width, an image can get a different width for each size range. Open **Edit image**: **Width (all size)** (Layout tab) is the normal width, and the **Responsive** tab sets the ranges below Large. Values are percentages (integers 5 to 100).

**One mode per image** (the switch above the inputs):

| Mode | Measured on | Use it for |
| --- | --- | --- |
| `container` (default) | the width of the editor / viewer content (`.rte-content`) | content that lives in a column, card, sidebar or any layout |
| `viewport` | the browser window | page-level layouts |

**Ranges.** Each range applies **only to itself** (there is no inheritance between ranges). An empty range keeps the normal width.

| Input | `viewport` (Tailwind screens) | `container` (Tailwind container scale) |
| --- | --- | --- |
| Extra Small | < 640px | < 28rem (448px), below `@md` |
| Small | 640 to 767px | 28rem to < 42rem (448 to 671px), `@md` to `@2xl` |
| Medium | 768 to 1023px | 42rem to < 56rem (672 to 895px), `@2xl` to `@4xl` |
| Large | ≥ 1024px | ≥ 56rem (896px), from `@4xl` |

**There is no input for Large.** The normal width, **Width (all size)**, is the Large width: it applies from Large up and to every range that has no value. So you set the desktop size once, in **Width (all size)**, and only override what is different on smaller sizes (a "desktop first" setup). A `lg` value in older data is ignored.

**Device hints.** The editor shows a hint under every input (texts in `RESPONSIVE_DEVICES`, `core/nodes/Image/responsive.ts`):

| Input | `viewport` | `container` |
| --- | --- | --- |
| Extra Small | Phones, portrait | Narrow column or card (phone-sized) |
| Small | Phones, landscape · small tablets | Narrow column |
| Medium | Tablets, portrait · large phones, landscape | Article-width column (tablet-sized) |
| Width (all size), from Large | Laptops · desktops · tablets, landscape | Wide content area (laptop-sized) |

The ranges are based on the window / content **width**, not on the device. A phone in landscape and a tablet in portrait cannot be told apart by width: modern phones are about 780 to 930px wide in landscape and an iPad about 768 to 834px in portrait, so both fall in Medium. In `container` mode the hints describe layouts, because the content width depends on the page, not on the device.

Equivalents of the Tailwind variants you may be used to (`viewport` mode):
- `max-sm` (< 640px) = **Extra Small**
- `max-md` (< 768px) = **Extra Small + Small** with the same value; Medium and up keep **Width (all size)**. It does not reach large phones in landscape (about 780 to 930px).
- `max-lg` (< 1024px) = **Extra Small + Small + Medium** with the same value; this also covers large phones in landscape, and tablets in portrait.

A value replaces **Width (all size)** (and the presets and resize handles, which set the same width) inside its range, so those controls look like they do nothing in a range that has a value. From Large up they work as usual. The editor says so while a responsive width is set.

Not possible without filling the smaller ranges: "small by default, bigger only on large screens" (mobile first). Set **Width (all size)** to the large width and fill Extra Small, Small and Medium with the small one.

**Stored as.**
- JSON: `responsive: { mode: "container" | "viewport", xs?: number, sm?: number, md?: number } | null`. `null` means no responsive width. The value is validated on every read (finite numbers only, rounded, clamped to 5 to 100), so nothing but numbers can reach the HTML.
- HTML / Markdown: `data-rw="container"` and `data-rw-xs` / `-sm` / `-md` on the image, plus inline custom properties (`--rte-w-md: 60%`, ...) and `--rte-w-base` (the normal width) that the stylesheet reads. An image with a responsive width is written as HTML in Markdown (it cannot be expressed natively).

**Requirements.**
- `styles/content.css` (imported by `Editor` and `Viewer`) turns `.rte-content` into a **named size container** (`container-name: rte; container-type: inline-size`). With inline-size containment the element's width must not depend on its content, so it needs a definite width: the stylesheet sets `width: 100%`. Do not make `.rte-content` an `inline-block` or an auto-width flex item, or it collapses to 0px.
- The container is the whole `.rte-content`, not the nearest parent. An image inside a table cell or blockquote uses the editor width for the ranges, while its percentage is still relative to the cell.
- `position: fixed` descendants are not affected.
- Container queries need Chrome 105+, Safari 16+ or Firefox 110+. Older browsers ignore the rules and show the normal width.
- The ranges live in two places that must stay in sync: `core/nodes/Image/responsive.ts` (labels, validation) and `styles/content.css` (the media and container queries).
- HTML / Markdown rendered **outside** this app keep the attributes but need the same CSS (and a container with a definite width) to react. Without it, the normal width is shown.

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

The HTML written by the editor (the `html` format and the HTML fallback inside Markdown):
- **Inline styles are compact**: `style="max-width:100%;height:auto"`, with no spaces after `:` or `;` and no trailing `;`. `jsonToHtml` applies `compactHtmlStyles` (`core/content/style-attr.ts`) to every `style` attribute and writes the attribute name in lowercase. It only touches text inside tags, so text that happens to contain `style="..."` is never changed.
- **Image values are escaped.** `src`, `alt`, `title` and the caption are HTML-escaped (`& < > " '`), so a quote or a `<` in an alt text no longer cuts the attribute short, loses the value on the way back, or adds attributes such as `onerror` to the tag. `align`, `displayMode`, `verticalAlign` and `height` can only be one of their known values or a plain CSS length; anything else is dropped. In the native syntax `![alt](src "title")`, brackets, backslashes and quotes are escaped and a URL with spaces or parentheses is wrapped in `<...>`.
- The `href` / `title` of a **link** written by the Markdown serializer (`core/content/link-markdown.ts`) are not escaped yet.

## Known limitations

- **No i18n yet.** UI texts are hardcoded in English and are not yet routed through `useTranslate` (Refine). Affected: control tooltips and labels, Link/Image/Video/Audio/Embed/Math popovers (labels, placeholders, buttons), the image "Edit image" modal (tabs, labels and buttons, including the responsive width labels), the ImageControl modal title (`Insert image`; the FilePicker inside is already translatable), table size picker and toolbar, code block header (`Code language`, `Code theme`, `Copy code`). To do: move them to the locale files.
- `createEditorExtensions()` (and `extensions` in general) must be a stable reference; a new array on each render rebuilds the editor.
- `readOnly` is a temporary lock, not a viewer.
- Uses the CSS classes `rte-*` (`../styles`); `mathlive/static.css` is imported by the component.
- `core/nodes/CodeBlock/languages.generated.ts` is generated from `@codemirror/language-data` (143 languages). Regenerate it if that package changes the list.

## Future features

> Planned / optional. **Not implemented**, so the details below may change.

### Image width stored as a number (percent)

Today the image `width` attribute is a CSS string (`"50%"`, `"480px"`), and the resize handles, the size presets, the Slider and the "Width (all size)" input each write it in their own way. The idea is to store **one number, a percentage from 1 to 100**, and build the CSS string only when rendering.

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
