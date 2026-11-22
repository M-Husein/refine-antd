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

### Edit image

**Edit image** (tombol pada gambar yang terpilih) membuka **drawer di kanan**, tanpa mask: editor di belakangnya tetap terlihat dan bisa dipakai. Isinya tiga tab:

| Tab | Isi |
| --- | --- |
| Layout | Image Align, Display mode, Size Preset, **Width (all size)** |
| Responsive | mode (Container / Viewport) dan rentang, lihat "Lebar responsif gambar" |
| Caption | Alt text, Caption, Caption Align |

Perilakunya:
- **Edit disimpan sekaligus.** Tidak ada yang masuk ke dokumen sebelum **Save**. Save menerapkan semua perubahan dalam **satu transaksi, sehingga satu Ctrl+Z membatalkan semuanya**. **Cancel**, tombol tutup, dan **Esc** membuang draf, dan drawer yang dibuka lagi selalu mulai dari nilai gambar saat itu. Save tetap nonaktif selama tidak ada yang berbeda dari awal.
- Hanya field yang Anda ubah yang ditulis, jadi field yang tidak disentuh (misalnya lebar `480px` yang tidak bisa ditampilkan form) tidak pernah ditimpa.
- Drawer **tidak bergantung pada seleksi**: mengklik teks di editor tidak menutupnya, dan Save tetap berlaku untuk gambar tempat drawer dibuka.
- **Satu drawer pada satu waktu.** Membuka drawer gambar lain menutup yang sebelumnya dan membuang edit yang belum disimpan.
- **Handle resize disembunyikan** selama drawer terbuka (jika tidak, lebar berubah di belakang draf); gunakan handle saat drawer tertutup.
- Isinya bisa digulir sendiri dan footer Save / Cancel selalu terlihat, juga di layar laptop (tinggi sekitar 650px) dan di ponsel.

### Nilai lebar gambar

`width` gambar juga bisa datang dari luar editor (JSON tersimpan, HTML yang ditempel, Markdown). Nilainya dibaca lewat satu fungsi toleran, `normalizeWidth` di `core/nodes/Image/size.ts`, yang dipakai oleh renderer React, serializer HTML, parser, dan serializer Markdown:

| Masukan | Hasil |
| --- | --- |
| `480`, `"480"` | `480px` (nilai piksel lama) |
| `"50%"`, `"20rem"`, `"30vw"`, `"12.5px"` | tidak berubah (satuan: `px`, `%`, `rem`, `em`, `vw`, `vh`, `ch`) |
| `0`, negatif, `NaN`, `"auto"`, `"fit-content"`, `"calc(...)"`, apa pun yang memuat `;` atau tanda kutip | diabaikan: gambar memakai ukuran aslinya |

Jadi lebar tidak lagi bisa menjadi CSS yang tidak valid (lebarnya hilang diam-diam) atau menyelundupkan CSS / atribut tambahan ke keluaran HTML dan Markdown. Kalau Anda butuh nilai CSS lain (misalnya `calc()`), polanya di `size.ts` harus ditambah.

`captionAlign` (default `left`, `center`, `right`) terjaga di JSON, HTML, dan Markdown (ditulis sebagai `text-align` pada `<figcaption>`).

Versi mendatang mungkin menyimpan lebar sebagai angka persen (lihat "Fitur mendatang").

### Lebar responsif gambar

Selain lebar normal, gambar bisa diberi lebar berbeda untuk setiap rentang ukuran. Buka **Edit image**: **Width (all size)** (tab Layout) adalah lebar normal, dan tab **Responsive** mengatur rentang di bawah Large. Nilainya persen (bilangan bulat 5 sampai 100).

**Satu mode per gambar** (pilihan di atas input):

| Mode | Diukur pada | Dipakai untuk |
| --- | --- | --- |
| `container` (default) | lebar konten editor / viewer (`.rte-content`) | konten yang berada di kolom, kartu, sidebar, atau layout apa pun |
| `viewport` | jendela browser | layout tingkat halaman |

**Rentang.** Tiap rentang berlaku **hanya untuk dirinya sendiri** (tidak ada pewarisan antar rentang). Rentang yang kosong memakai lebar normal.

| Input | `viewport` (screens Tailwind) | `container` (skala container Tailwind) |
| --- | --- | --- |
| Extra Small | < 640px | < 28rem (448px), di bawah `@md` |
| Small | 640 sampai 767px | 28rem sampai < 42rem (448 sampai 671px), `@md` sampai `@2xl` |
| Medium | 768 sampai 1023px | 42rem sampai < 56rem (672 sampai 895px), `@2xl` sampai `@4xl` |
| Large | ≥ 1024px | ≥ 56rem (896px), mulai `@4xl` |

**Tidak ada input untuk Large.** Lebar normal, **Width (all size)**, adalah lebar Large: berlaku mulai Large ke atas dan untuk setiap rentang yang tidak punya nilai. Jadi ukuran desktop cukup diatur sekali di **Width (all size)**, dan Anda hanya meng-override yang berbeda di ukuran lebih kecil (pendekatan "desktop first"). Nilai `lg` di data lama diabaikan.

**Petunjuk perangkat.** Editor menampilkan petunjuk di bawah setiap input (teksnya di `RESPONSIVE_DEVICES`, `core/nodes/Image/responsive.ts`):

| Input | `viewport` | `container` |
| --- | --- | --- |
| Extra Small | Phones, portrait | Narrow column or card (phone-sized) |
| Small | Phones, landscape · small tablets | Narrow column |
| Medium | Tablets, portrait · large phones, landscape | Article-width column (tablet-sized) |
| Width (all size), mulai Large | Laptops · desktops · tablets, landscape | Wide content area (laptop-sized) |

Rentang didasarkan pada **lebar** jendela / konten, bukan pada perangkat. Ponsel landscape dan tablet portrait tidak bisa dibedakan dari lebarnya: ponsel modern sekitar 780 sampai 930px di landscape dan iPad sekitar 768 sampai 834px di portrait, jadi keduanya masuk Medium. Pada mode `container` petunjuknya menggambarkan tata letak, karena lebar konten bergantung pada halaman, bukan pada perangkat.

Padanan varian Tailwind yang biasa Anda pakai (mode `viewport`):
- `max-sm` (< 640px) = **Extra Small**
- `max-md` (< 768px) = **Extra Small + Small** dengan nilai yang sama; Medium ke atas tetap memakai **Width (all size)**. Tidak menjangkau ponsel besar saat landscape (sekitar 780 sampai 930px).
- `max-lg` (< 1024px) = **Extra Small + Small + Medium** dengan nilai yang sama; ini juga mencakup ponsel besar saat landscape, dan tablet portrait.

Nilai rentang menggantikan **Width (all size)** (beserta preset dan handle resize, yang mengatur lebar yang sama) di dalam rentangnya, sehingga kontrol itu terlihat tidak berpengaruh di rentang yang punya nilai. Mulai Large ke atas semuanya bekerja seperti biasa. Editor memberi tahu hal ini selama lebar responsif diatur.

Tidak bisa tanpa mengisi rentang yang lebih kecil: "kecil secara default, lebih besar hanya di layar besar" (mobile first). Atur **Width (all size)** ke lebar besar lalu isi Extra Small, Small, dan Medium dengan lebar yang kecil.

**Disimpan sebagai.**
- JSON: `responsive: { mode: "container" | "viewport", xs?: number, sm?: number, md?: number } | null`. `null` berarti tidak ada lebar responsif. Nilai divalidasi di setiap pembacaan (hanya angka terbatas, dibulatkan, dibatasi 5 sampai 100), sehingga hanya angka yang bisa sampai ke HTML.
- HTML / Markdown: `data-rw="container"` dan `data-rw-xs` / `-sm` / `-md` pada gambar, ditambah custom property inline (`--rte-w-md: 60%`, ...) dan `--rte-w-base` (lebar normal) yang dibaca stylesheet. Gambar dengan lebar responsif ditulis sebagai HTML di Markdown (tidak bisa diungkapkan secara native).

**Persyaratan.**
- `styles/content.css` (di-import oleh `Editor` dan `Viewer`) menjadikan `.rte-content` sebuah **size container bernama** (`container-name: rte; container-type: inline-size`). Dengan containment inline-size, lebar elemen tidak boleh bergantung pada isinya, jadi harus punya lebar pasti: stylesheet menyetel `width: 100%`. Jangan menjadikan `.rte-content` sebagai `inline-block` atau flex item dengan lebar auto, atau lebarnya menyusut menjadi 0px.
- Container-nya adalah seluruh `.rte-content`, bukan induk terdekat. Gambar di dalam sel tabel atau blockquote memakai lebar editor untuk menentukan rentang, sedangkan persennya tetap relatif terhadap sel.
- Elemen turunan `position: fixed` tidak terpengaruh.
- Container query membutuhkan Chrome 105+, Safari 16+, atau Firefox 110+. Browser yang lebih lama mengabaikan aturannya dan menampilkan lebar normal.
- Rentang ada di dua tempat yang harus tetap sinkron: `core/nodes/Image/responsive.ts` (label, validasi) dan `styles/content.css` (media dan container query).
- HTML / Markdown yang dirender **di luar** app ini tetap membawa atributnya, tetapi butuh CSS yang sama (dan container dengan lebar pasti) agar bereaksi. Tanpa itu, lebar normal yang ditampilkan.

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

HTML yang ditulis editor (format `html` dan fallback HTML di dalam Markdown):
- **Style inline ditulis ringkas**: `style="max-width:100%;height:auto"`, tanpa spasi setelah `:` atau `;` dan tanpa `;` di akhir. `jsonToHtml` menerapkan `compactHtmlStyles` (`core/content/style-attr.ts`) pada setiap atribut `style` dan menulis nama atributnya dengan huruf kecil. Fungsi itu hanya menyentuh teks di dalam tag, sehingga teks yang kebetulan memuat `style="..."` tidak pernah berubah.
- **Nilai gambar di-escape.** `src`, `alt`, `title`, dan caption di-escape sebagai HTML (`& < > " '`), sehingga tanda kutip atau `<` di alt text tidak lagi memotong atribut, menghilangkan nilainya saat dibaca balik, atau menambah atribut seperti `onerror` pada tag. `align`, `displayMode`, `verticalAlign`, dan `height` hanya boleh salah satu nilai yang dikenal atau panjang CSS sederhana; selain itu dibuang. Pada sintaks native `![alt](src "title")`, kurung siku, backslash, dan tanda kutip di-escape, dan URL yang mengandung spasi atau tanda kurung dibungkus `<...>`.
- `href` / `title` pada **link** yang ditulis serializer Markdown (`core/content/link-markdown.ts`) belum di-escape.

## Keterbatasan yang diketahui

- **Belum ada i18n.** Teks UI di-hardcode dalam bahasa Inggris dan belum lewat `useTranslate` (Refine). Terdampak: tooltip dan label control, popover Link/Image/Video/Audio/Embed/Math (label, placeholder, tombol), drawer "Edit image" (tab, label, dan tombol, termasuk label lebar responsif), judul modal ImageControl (`Insert image`; FilePicker di dalamnya sudah bisa diterjemahkan), pemilih ukuran dan toolbar tabel, header code block (`Code language`, `Code theme`, `Copy code`). To do: pindahkan ke file locale.
- `createEditorExtensions()` (dan `extensions` pada umumnya) harus referensi yang stabil; array baru di setiap render membangun ulang editor.
- `readOnly` hanya kunci sementara, bukan viewer.
- Memakai class CSS `rte-*` (`../styles`); `mathlive/static.css` di-import oleh komponen.
- `core/nodes/CodeBlock/languages.generated.ts` di-generate dari `@codemirror/language-data` (143 bahasa). Generate ulang jika daftar di package tersebut berubah.

## Fitur mendatang

> Direncanakan / opsional. **Belum diimplementasi**, jadi detail di bawah bisa berubah.

### Lebar gambar disimpan sebagai angka (persen)

Saat ini atribut `width` gambar berupa string CSS (`"50%"`, `"480px"`), dan handle resize, preset ukuran, Slider, serta input "Width (all size)" masing-masing menulisnya dengan cara sendiri. Idenya: simpan **satu angka, persen 1 sampai 100**, dan bentuk string CSS hanya saat render.

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
