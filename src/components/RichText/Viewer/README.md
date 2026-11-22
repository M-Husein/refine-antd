# RichText / Viewer

Read-only renderer for content produced by [`Editor`](../Editor/README.md). It is **not** `<Editor readOnly />`: it never creates a Tiptap editor, a ProseMirror view or editing NodeViews. It walks the document and renders plain React elements, so it is cheap to use on list/detail pages.

```tsx
import { Viewer, createViewerPreset } from '@/components/RichText/Viewer';
```

## Usage

```tsx
const preset = createViewerPreset(); // module constant or useMemo — NOT inline

<Viewer value={post.body} format="markdown" {...preset} />
```

Without `preset` the Viewer only renders the core nodes (paragraphs, headings, lists, links, marks). Table, image, video, audio, embed, math and code block need the preset (or the individual extensions/renderers).

## Props

`ViewerProps`

| Prop            | Type                             | Description                                                                             |
| --------------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| `value`         | `string \| JSONContent`          | Content. Its shape depends on `format`.                                                 |
| `format`        | `'json' \| 'html' \| 'markdown'` | Default `json`.                                                                         |
| `extensions`    | `AnyExtension[]`                 | Only used to *parse* html/markdown into JSON (a headless schema, no editor is created). |
| `nodeRenderers` | `Record<string, NodeRenderer>`   | Add/override how a node is rendered.                                                    |
| `markRenderers` | `Record<string, MarkRenderer>`   | Add/override how a mark is rendered.                                                    |
| `className`     | `string`                         | Class of the root element.                                                              |

`createViewerPreset({ allowedCustomOrigins })` returns `{ extensions, nodeRenderers }`. Use the same `allowedCustomOrigins` as the Editor (see "Embed security" in the [Editor README](../Editor/README.md)).

## Responsive image width

Images can carry per-range widths (`responsive`, see "Image responsive width" in the [Editor README](../Editor/README.md)). The Viewer renders them with the same CSS (`styles/content.css`), which makes the `.rte-viewer` root a named size container (`rte`, `container-type: inline-size`). That needs a definite width: the stylesheet sets `width: 100%`; do not place the Viewer in an `inline-block` or an auto-width flex item.

## Bundle

The Viewer does not statically import `@tiptap/react`, ProseMirror state/view, `mathlive`, `@ant-design/icons` or CodeMirror. Code highlighting loads `@codemirror/language-data` and `@lezer/highlight` lazily with `import()`. Keep it that way: a page that only displays content should not download the editor. Import from `@/components/RichText/Viewer`, never from a barrel that also exports `Editor`.

## Known limitations

- **No i18n yet.** UI texts (code block header: `Code language`, `Code theme`, `Copy code`; blocked embed message) are hardcoded in English and not yet routed through `useTranslate`. To do: move them to the locale files.
- `extensions`, `nodeRenderers` and `markRenderers` must be stable references (`useMemo` / module constant).
- `extensions` is only read for the html/markdown parse; changing it alone does not re-parse the content.
