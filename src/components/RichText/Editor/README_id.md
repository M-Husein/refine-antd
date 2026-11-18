# RichText / Editor

Rich text editor berbasis [Tiptap](https://tiptap.dev) + Ant Design. Dokumen kanonik adalah Tiptap JSON; HTML dan Markdown adalah representasinya (prop `format`). Gunakan bersama [`Viewer`](../Viewer/README_id.md) untuk menampilkan konten secara read-only.

```tsx
import { Editor, Content, Bold, Italic, createEditorExtensions } from '@/components/RichText/Editor';
```

> Toolbar **tidak** disediakan: control (`Bold`, `Link`, ...) adalah komponen terpisah dan Anda yang menentukan layout-nya. `Content` adalah area yang bisa diedit.

## Cara pakai

```tsx
const extensions = createEditorExtensions(); // konstanta modul atau useMemo — JANGAN inline

const [value, setValue] = useState<string | JSONContent>('<p>Halo</p>');

<Editor value={value} format="html" onChange={setValue} extensions={extensions} placeholder="Mulai mengetik...">
  <Space.Compact>
    <Bold />
    <Italic />
  </Space.Compact>
  <Content />
</Editor>
```

Di dalam form (`value`/`onChange` disuntikkan oleh `Form.Item`):

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

| Prop          | Tipe                             | Deskripsi                                                                              |
| ------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| `value`       | `string \| JSONContent`          | Nilai terkontrol. Bentuknya mengikuti `format`.                                        |
| `format`      | `'json' \| 'html' \| 'markdown'` | Format `value` / `onChange`. Default `json`.                                           |
| `onChange`    | `(value) => void`                | Dipanggil dengan nilai berformat sama.                                                 |
| `readOnly`    | `boolean`                        | Mengunci editor. Untuk tampilan read-only sungguhan gunakan `Viewer`.                  |
| `placeholder` | `string`                         | Ditampilkan saat dokumen kosong.                                                       |
| `extensions`  | `AnyExtension[]`                 | Extension Tiptap tambahan (table, image, ...). Extension bernama sama menggantikan core. |
| `className`   | `string`                         | Class elemen root.                                                                     |
| `children`    | `ReactNode`                      | Control + `<Content />`.                                                               |

`createEditorExtensions({ allowedCustomOrigins })` mengaktifkan table, image, video, audio, embed, math, dan code block (CodeMirror 6) beserta UI editingnya.

## Control

`Bold`, `Italic`, `Underline`, `Strikethrough`, `Heading`, `BulletList`, `OrderedList`, `Checklist`, `CodeBlockControl`, `Link`, `TableControl`, `TableToolbar`, `ImageControl`, `VideoControl`, `AudioControl`, `EmbedControl`, `MathControl`, `Undo`, `Redo`, `FindAndReplace`.

Control membutuhkan extension yang sesuai, mis. `ImageControl` butuh extension image dari `createEditorExtensions()`. Di luar `<Editor>` control tidak merender apa pun. `useRichTextEditor()` mengembalikan instance editor Tiptap untuk control buatan sendiri.

### ImageControl

Membuka modal berisi [`FilePicker`](../../FilePicker/README_id.md): pilih, drop, atau paste gambar, atau tambahkan dari URL, kamera, atau layar. Props FilePicker diteruskan langsung, jadi picker dikonfigurasi di control-nya:

```tsx
<Space>
  <ImageControl pasteUrl webcam multiple />
</Space>
```

| Prop | Deskripsi |
| --- | --- |
| Props FilePicker | `pasteUrl`, `webcam`, `screenCapture`, `fetchUrl`, `urlTimeout`, `multiple`, `maxCount`, `accept` (default `image/*`), `pastable` (default `true`), `action`, `customRequest`, `beforeUpload`, `onChange`, `listType`, `hint`, `renderExtra`, ... |
| `getUrl(file)` | Mengubah `UploadFile` yang sudah diunggah menjadi `src` gambar. Default: respons bila berupa string, lalu `response.url` / `response.data.url`, lalu `file.url`. |
| `modalTitle`, `modalProps` | Judul dan props tambahan antd Modal. |
| Props Button | `icon`, `size`, `type`, `disabled`, `className`, ... diteruskan ke tombol pemicu. Nama yang sama dengan FilePicker (`disabled`, `className`, `style`, `type`, `children`) tetap bermakna **tombol**; `name` dan `onChange` ke picker. `disabled` berlaku untuk keduanya. |

Asal gambar:
- **Tanpa `action` / `customRequest`:** gambar disematkan sebagai **data URL** (base64). Sederhana, tetapi konten membesar sekitar 33% dari ukuran file, jadi validasi ukuran di `beforeUpload` atau gunakan upload.
- **`action="/api/upload"`** (atau `customRequest`): file diunggah dan URL dibaca dari respons (`getUrl`).

Perilaku: gambar dalam satu batch disisipkan bersamaan, sesuai urutan pemilihan, setelah tidak ada yang masih diunggah. Gambar disisipkan **setelah** gambar yang sedang terpilih, bukan menggantinya. Modal menutup bila semua berhasil dan tetap terbuka bila ada file gagal supaya error terlihat. `src` berskema `javascript:`, `vbscript:`, atau `data:` non-gambar ditolak.

Membutuhkan konteks Refine (FilePicker memakai `useTranslate`).

## Berpindah format

`value` dan `format` harus berubah bersamaan (json berupa objek, html/markdown berupa string). Gunakan `convertContent` untuk meng-encode ulang dokumen saat ini dengan schema lengkap:

```tsx
import { convertContent } from '@/components/RichText/Editor';

const changeFormat = (next: ContentFormat) => {
  setValue(convertContent(value, format, next, extensions)); // `extensions` sama dengan <Editor>
  setFormat(next);
};
```

Jangan memanggil `serializeContent`/`parseContent` hanya dengan extension tambahan: schema tidak punya node `doc`. Dokumen JSON yang dikirim saat `format` html/markdown tetap dibaca sebagai JSON (tidak pernah jadi teks "[object Object]").

## Keamanan embed

Embed hanya merender YouTube dan Vimeo secara default. Provider `custom` hanya merender hostname yang ada di `allowedCustomOrigins`; selain itu ditampilkan sebagai placeholder terblokir, tidak pernah iframe. Gunakan daftar yang **sama** di `createEditorExtensions` dan `createViewerPreset`.

## Markdown

Serialisasi Markdown tidak menghilangkan informasi: hal yang tidak bisa diekspresikan Markdown (alignment gambar, lebar kolom tabel, embed, ...) memakai fallback HTML inline. Math memakai `$...$` / `$$...$$`.

## Keterbatasan yang diketahui

- **Belum ada i18n.** Teks UI di-hardcode dalam bahasa Inggris dan belum lewat `useTranslate` (Refine). Terdampak: tooltip dan label control, popover Link/Image/Video/Audio/Embed/Math (label, placeholder, tombol), judul modal ImageControl (`Insert image`; FilePicker di dalamnya sudah bisa diterjemahkan), pemilih ukuran dan toolbar tabel, header code block (`Code language`, `Code theme`, `Copy code`). To do: pindahkan ke file locale.
- `createEditorExtensions()` (dan `extensions` pada umumnya) harus referensi yang stabil; array baru di setiap render membangun ulang editor.
- `readOnly` hanya kunci sementara, bukan viewer.
- Memakai class CSS `rte-*` (`../styles`); `mathlive/static.css` di-import oleh komponen.
- `core/nodes/CodeBlock/languages.generated.ts` di-generate dari `@codemirror/language-data` (143 bahasa). Generate ulang jika daftar di package tersebut berubah.

## Fitur mendatang

> Direncanakan / opsional. **Belum diimplementasi**, jadi detail di bawah bisa berubah.

### Lebar gambar disimpan sebagai angka (persen)

Saat ini atribut `width` gambar berupa string CSS (`"50%"`, `"480px"`), dan handle resize, preset ukuran, Slider, serta input "Custom Width" masing-masing menulisnya dengan cara sendiri. Idenya: simpan **satu angka, persen 1 sampai 100**, dan bentuk string CSS hanya saat render.

Alasan:
- Slider dan InputNumber terhubung langsung ke atribut, tanpa `parseFloat` / `formatter` / `parser`.
- Cukup satu validasi (bilangan bulat 1 sampai 100). Angka tidak bisa membawa CSS, jadi dokumen tidak lagi bisa menyelundupkan `50%; position:fixed` atau `50%" onerror=...` ke atribut `style` di HTML/Markdown.
- Keluaran HTML dan Markdown selalu valid (`width: 50%`), dan nilai tanpa satuan seperti `"480"` tidak lagi hilang.

Catatan desain:
- **Data lama.** Sebelum perubahan ini `width` berupa angka **piksel** (`width: 480`, `width="480"`), sehingga `480` tiba-tiba berarti 480%. Pembacaan harus lewat satu fungsi toleran, dipakai oleh `ImageFigure`, `renderHTML`, dan `markdown.ts` (Tiptap tidak menjalankan `parseHTML` saat memuat JSON, jadi sisi render juga harus menormalkan):
  ```ts
  toPercent(value): number | null
  // number 1..100     -> value (dibulatkan)
  // "50%"             -> 50
  // px, > 100, NaN    -> null  (ukuran asli, tidak ada yang rusak)
  ```
  Lebar px tidak bisa diubah menjadi persen tanpa mengetahui lebar kontainer, jadi jatuh ke ukuran asli. Tulis ini di catatan migrasi.
- **Satu titik konversi.** `` width ? `${toPercent(width)}%` : "fit-content" `` hanya di renderer; semua penulis (handle, preset, Slider, InputNumber) menyimpan bilangan bulat.
- **Nama atribut.** Tetap `width` dan dokumentasikan bahwa isinya persen, atau ganti menjadi `widthPercent`. Mengganti nama menghilangkan ambiguitas dengan nilai piksel lama, tetapi migrasinya lebih besar.
- **Selalu dibulatkan.** Simpan bilangan bulat, supaya tidak muncul nilai seperti `33.3333`.
- **Slider.** `onChange` menyala di setiap gerakan dan membuat satu transaksi per gerakan (seperti handle resize). Simpan nilai lokal untuk pratinjau langsung dan commit di `onChangeComplete`; tampilkan nilainya dengan `` tooltip={{ formatter: (v) => `${v}%` }} ``.
- **Batas.** Maksimum 100 berarti gambar tidak pernah lebih lebar dari kontainernya. Ini disengaja.

## Struktur

```
RichText/
  Editor/    komponen ini (Editor, Content, Context, controls/, nodeviews/, preset.ts)
  Viewer/    renderer read-only
  core/      dipakai keduanya: content/ (json, html, markdown), extensions/, nodes/, renderer/, types
  styles/    content.css, editor.css, viewer.css
```

`Viewer` tidak boleh meng-import kode khusus editor (`@tiptap/react`, ProseMirror state/view, `mathlive`, CodeMirror); simpan kode editing di `core/nodes/*/editor` dan `Editor/`.
