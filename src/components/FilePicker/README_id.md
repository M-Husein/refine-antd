# FilePicker

Pembungkus tipis untuk antd [`Upload.Dragger`](https://ant.design/components/upload). **Semua** props dan perilaku `Upload` tetap bisa dipakai (drag & drop, `pastable`, `accept`, `maxCount`, `fileList`, `action`, `onChange`, dll.), ditambah:

- `maxBytes` – batas ukuran per file
- `webcam` – ambil foto dengan kamera
- `screenCapture` – tangkap layar / jendela / tab
- `renderExtra` – slot untuk tombol masa depan (File Manager, Google Drive, ...)
- Screenshot hasil paste diberi nama `pasted-<timestamp>.png`, bukan `image.png` yang generik

```tsx
import { FilePicker } from '@/components/FilePicker';
```

## Cara pakai

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

Di dalam form (upload dikontrol antd, jadi gunakan `valuePropName`/`getValueFromEvent`):

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

| Prop            | Tipe                   | Keterangan                                                                                              |
| --------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `maxBytes`      | `number`               | Ukuran maksimal per file (bytes). File yang lebih besar ditolak dengan pesan error dan tidak masuk list. |
| `webcam`        | `boolean`              | Tampilkan tombol "Ambil foto". Otomatis tersembunyi jika tidak didukung.                                |
| `screenCapture` | `boolean`              | Tampilkan tombol "Tangkap layar". Otomatis tersembunyi jika tidak didukung.                             |
| `renderExtra`   | `() => ReactNode`      | Dirender di samping tombol capture.                                                                     |
| `hint`          | `ReactNode`            | Teks di bawah teks utama area drop. Default-nya ukuran maksimal jika `maxBytes` diisi.                  |
| `children`      | `ReactNode`            | Mengganti isi default area drop.                                                                        |
| `pastable`      | `boolean` (antd)       | Paste file/gambar dari clipboard. Otomatis nonaktif saat `disabled`.                                    |
| `ref`           | `Ref<UploadRef>`       | Ref dari antd `Upload` di dalamnya (`nativeElement`, `upload`). React 19: prop biasa, tanpa `forwardRef`. |
| ...rest         | `UploadProps` (antd)   | Sisanya diteruskan ke `Upload.Dragger`.                                                                 |

### Ref

```tsx
import type { UploadRef } from 'antd';

const ref = useRef<UploadRef>(null);

<FilePicker ref={ref} />

ref.current?.nativeElement; // elemen DOM Upload
ref.current?.upload;        // instance rc-upload, mis. .abort(file)
```

Ref mengarah ke antd `Upload`, bukan ke `<div>` pembungkus `FilePicker`. Membutuhkan React 19 (`ref` sebagai prop).

## Cara kerja

### Paste (`pastable`)
Ini fitur bawaan antd. antd memasang listener `paste` global di `document` dan memanggil `preventDefault()` **hanya jika clipboard berisi file**. Jadi paste teks biasa ke input tidak terganggu, dan pengecekan `document.activeElement` tidak diperlukan.

Hal yang perlu diperhatikan:
- Paste gambar ke `<textarea>`/rich-text editor di halaman yang sama juga akan ditangkap oleh FilePicker.
- Aktifkan `pastable` hanya pada **satu** FilePicker per halaman, kalau tidak file yang sama masuk ke semuanya.
- Jika FilePicker ada di Modal/Drawer yang tetap ter-mount, gunakan `pastable={open}`.

### `maxBytes`
Dicek di dalam `beforeUpload`. `beforeUpload` milik Anda tetap dipanggil setelahnya (dengan file yang mungkin sudah diganti namanya), sehingga validasi tambahan tetap bisa dilakukan. Kembalikan `Upload.LIST_IGNORE` untuk menolak file.

### Webcam & screen capture
- Tombol hanya muncul jika `window.isSecureContext` (HTTPS atau `localhost`) dan `navigator.mediaDevices.getUserMedia` / `getDisplayMedia` tersedia.
- Modal menampilkan pratinjau langsung. Tekan **Ambil** (Capture), lalu **Gunakan** (Use) atau **Ulangi** (Retake).
- Hasilnya adalah `File` (`webcam-<timestamp>.png` / `screen-<timestamp>.png`) yang melewati alur antd seperti biasa (`accept`, `maxCount`, `beforeUpload`, `action`, `onChange`), sama seperti file yang dipilih dari disk.
- Stream media selalu dimatikan saat modal ditutup, sehingga indikator kamera/layar mati.

### Slot tambahan

```tsx
<FilePicker renderExtra={() => <Button onClick={openFileManager}>File Manager</Button>} />
```

## Terjemahan

Memakai `useTranslate` dari refine dengan default Bahasa Inggris. Key:

`filePicker.text`, `filePicker.orPaste`, `filePicker.maxSize` (`{{max}}`), `filePicker.tooLarge` (`{{name}}`, `{{max}}`), `filePicker.notAccepted`, `filePicker.webcam`, `filePicker.screenCapture`, `filePicker.capture`, `filePicker.retake`, `filePicker.use`, `filePicker.captureFailed`, `filePicker.permissionDenied`, `buttons.cancel`.

## Catatan

- Komponen memakai `App.useApp()` untuk pesan, jadi harus dirender di dalam antd `<App>`.
- Belum termasuk: paste URL (fetch dari tautan), integrasi File Manager dan Google Drive.
