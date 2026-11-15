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

Rename `pasted-<timestamp>` berlaku untuk file bernama `image.png`/`image.jpg`/... selama `pastable` aktif. Jika `beforeUpload` Anda mengembalikan `false` (tanpa upload), antd memakai file aslinya, sehingga rename tidak berlaku.

### Webcam & screen capture
- Tombol hanya muncul jika `window.isSecureContext` (HTTPS atau `localhost`) dan `navigator.mediaDevices.getUserMedia` / `getDisplayMedia` tersedia.
- Modal menampilkan pratinjau langsung. Tekan **Ambil** (Capture), lalu **Gunakan** (Use) atau **Ulangi** (Retake).
- Hasilnya adalah `File` (`webcam-<timestamp>.png` / `screen-<timestamp>.png`) yang melewati alur antd seperti biasa (`accept`, `maxCount`, `beforeUpload`, `action`, `onChange`), sama seperti file yang dipilih dari disk.
- Pratinjau webcam ter-mirror (tampilan selfie) dan foto yang disimpan juga ter-mirror, sehingga sama dengan yang terlihat. Screen capture tidak pernah di-mirror.
- File hasil capture dicek terhadap `accept` sebelum masuk ke alur antd. Jika tidak cocok, error ditampilkan dan tidak ada yang ditambahkan.
- Jika izin ditolak (webcam) atau perangkat tidak bisa dibuka, pesan error ditampilkan dan modal ditutup. Membatalkan dialog pilih layar menutup modal tanpa pesan.
- Stream media selalu dimatikan saat modal ditutup (termasuk saat ditutup ketika browser masih meminta izin), sehingga indikator kamera/layar mati.

### Slot tambahan

```tsx
<FilePicker renderExtra={() => <Button onClick={openFileManager}>File Manager</Button>} />
```

## Terjemahan

Memakai `useTranslate` dari refine dengan default Bahasa Inggris. Key:

`filePicker.text`, `filePicker.orPaste`, `filePicker.maxSize` (`{{max}}`), `filePicker.tooLarge` (`{{name}}`, `{{max}}`), `filePicker.notAccepted`, `filePicker.webcam`, `filePicker.screenCapture`, `filePicker.capture`, `filePicker.retake`, `filePicker.use`, `filePicker.captureFailed`, `filePicker.permissionDenied`, `buttons.cancel`.

## Catatan

- Belum diimplementasikan: lihat [Fitur mendatang](#fitur-mendatang).

## Fitur mendatang

> Rencana / opsional. **Belum diimplementasikan**, jadi API di bawah masih bisa berubah.

### `pasteUrl` (tambah file dari URL)

Pengguna bisa menambah file dengan mengetik atau mem-paste tautan. File di-fetch di browser, diubah menjadi `File`, lalu melewati alur antd yang sama seperti sumber lain (`accept`, `maxCount`, `beforeUpload`, `action`, `onChange`).

Usulan API:

```ts
pasteUrl?: boolean;                                                // tampilkan tombol "From URL"
fetchUrl?: (url: string, signal: AbortSignal) => Promise<Blob>;    // fetch kustom, mis. lewat proxy backend
urlTimeout?: number;                                               // default 15000 ms
```

Catatan desain:
- **Pemicu:** tombol "From URL" yang membuka popover/modal berisi input. Listener `paste` global untuk teks bersifat opsional (fase 2) dan butuh guard `document.activeElement` (`input`, `textarea`, `select`, `contenteditable`), karena paste teks ke input adalah hal biasa. Paste file (`pastable`) tidak butuh guard ini.
- **Alur:** validasi URL (hanya `http:`/`https:`) → `fetch` dengan `AbortController` + timeout → cek `res.ok` → cek `Content-Length` / `blob.size` terhadap `maxBytes` → cek `blob.type` terhadap `accept` (fallback: ekstensi URL) → tentukan nama file (`Content-Disposition`, path URL, atau `url-<timestamp>.<ext>`) → tambahkan sebagai `File`.
- **CORS:** `fetch` lintas origin gagal jika server tidak mengirim `Access-Control-Allow-Origin`, dan `no-cors` menghasilkan respons opaque yang tidak bisa dibaca. Gunakan `fetchUrl` untuk lewat proxy backend.
- **Keamanan:** jika proxy di server ditambahkan, batasi skema, blokir IP privat/localhost (SSRF), dan batasi ukuran serta timeout di server. Jangan pernah merender konten hasil fetch sebagai HTML.
- **Error yang perlu ditangani:** URL tidak valid, protokol tidak didukung, gagal CORS/jaringan, HTTP 4xx/5xx, timeout, tipe tidak diterima, file terlalu besar, dibatalkan.

### Ide lain
- Integrasi File Manager lewat `renderExtra`.
- Integrasi Google Drive lewat `renderExtra`.
