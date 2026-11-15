# RichText / Viewer

Renderer read-only untuk konten dari [`Editor`](../Editor/README_id.md). Ini **bukan** `<Editor readOnly />`: tidak pernah membuat editor Tiptap, view ProseMirror, atau NodeView editing. Ia menelusuri dokumen dan merender elemen React biasa, sehingga ringan untuk halaman list/detail.

```tsx
import { Viewer, createViewerPreset } from '@/components/RichText/Viewer';
```

## Cara pakai

```tsx
const preset = createViewerPreset(); // konstanta modul atau useMemo — JANGAN inline

<Viewer value={post.body} format="markdown" {...preset} />
```

Tanpa `preset`, Viewer hanya merender node core (paragraf, heading, list, link, mark). Table, image, video, audio, embed, math, dan code block membutuhkan preset (atau extension/renderer satuan).

## Props

`ViewerProps`

| Prop            | Tipe                             | Deskripsi                                                                              |
| --------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| `value`         | `string \| JSONContent`          | Konten. Bentuknya mengikuti `format`.                                                  |
| `format`        | `'json' \| 'html' \| 'markdown'` | Default `json`.                                                                        |
| `extensions`    | `AnyExtension[]`                 | Hanya untuk *mem-parse* html/markdown ke JSON (schema headless, tanpa membuat editor). |
| `nodeRenderers` | `Record<string, NodeRenderer>`   | Tambah/ganti cara render sebuah node.                                                  |
| `markRenderers` | `Record<string, MarkRenderer>`   | Tambah/ganti cara render sebuah mark.                                                  |
| `className`     | `string`                         | Class elemen root.                                                                     |

`createViewerPreset({ allowedCustomOrigins })` mengembalikan `{ extensions, nodeRenderers }`. Pakai `allowedCustomOrigins` yang sama dengan Editor (lihat "Keamanan embed" di [README Editor](../Editor/README_id.md)).

## Bundle

Viewer tidak meng-import statis `@tiptap/react`, ProseMirror state/view, `mathlive`, `@ant-design/icons`, atau CodeMirror. Syntax highlighting memuat `@codemirror/language-data` dan `@lezer/highlight` secara lazy lewat `import()`. Pertahankan: halaman yang hanya menampilkan konten tidak boleh mengunduh editor. Import dari `@/components/RichText/Viewer`, jangan dari barrel yang juga mengekspor `Editor`.

## Keterbatasan yang diketahui

- **Belum ada i18n.** Teks UI (header code block: `Code language`, `Code theme`, `Copy code`; pesan embed terblokir) di-hardcode dalam bahasa Inggris dan belum lewat `useTranslate`. To do: pindahkan ke file locale.
- `extensions`, `nodeRenderers`, dan `markRenderers` harus referensi stabil (`useMemo` / konstanta modul).
- `extensions` hanya dibaca saat parse html/markdown; mengubahnya saja tidak mem-parse ulang konten.
