# FilePicker

Pembungkus tipis untuk antd [`Upload.Dragger`](https://ant.design/components/upload). **Semua** props dan perilaku `Upload` tetap bisa dipakai (drag & drop, `pastable`, `accept`, `maxCount`, `fileList`, `action`, `onChange`, dll.), ditambah:

- `maxBytes` – batas ukuran per file
- `webcam` – ambil foto dengan kamera
- `screenCapture` – tangkap layar / jendela / tab
- `pasteUrl` – tambah file dari tautan (tombol "From URL")
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
  pasteUrl
  onChange={({ fileList }) => setFiles(fileList)}
/>
```

Demo langsung: `/docs/components/file-picker` ([source](../../pages/docs/components/file-picker/Page.tsx)).

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
| `pasteUrl`      | `boolean`              | Tampilkan tombol "From URL": tambah file dengan memasukkan tautan.                                      |
| `fetchUrl`      | `(url, signal) => Promise<Blob>` | Fetch kustom untuk `pasteUrl`, mis. lewat proxy backend untuk mengatasi CORS.                 |
| `urlTimeout`    | `number`               | Timeout fetch URL dalam ms. Default `15000`.                                                            |
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

### Dari URL (`pasteUrl`)
- Tombol **From URL** membuka modal berisi input. Tekan **Enter** atau **Add** untuk mengambil tautan. **Cancel**/tutup modal membatalkan request yang sedang berjalan.
- Alur: validasi URL (hanya `http:`/`https:`) → `fetch` dengan timeout (`urlTimeout`) → cek `res.ok` → cek `Content-Length` dan ukuran sebenarnya terhadap `maxBytes` → cek tipe terhadap `accept` → ditambahkan sebagai `File`. Setelah itu melewati alur antd seperti biasa (`accept`, `maxCount`, `beforeUpload`, `action`, `onChange`).
- Nama file: header `Content-Disposition`, jika tidak ada maka segmen terakhir path URL, jika tidak ada maka `url-<timestamp>.<ext>`.
- Tipe file: `Content-Type` dari respons. Jika server tidak mengirimnya (atau `application/octet-stream`), tipe ditebak dari ekstensi file.
- Error ditampilkan di dalam modal: URL tidak valid, protokol tidak didukung, error HTTP (dengan status), timeout, tipe tidak diterima, terlalu besar, dan kegagalan jaringan/CORS.
- **CORS:** `fetch` lintas origin hanya berhasil jika server mengirim `Access-Control-Allow-Origin`. Jika tidak, browser memblokir pembacaan respons dan muncul error "jaringan/CORS". Agar semua tautan bisa dipakai, berikan `fetchUrl` dan lewatkan lewat backend Anda:

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

Jika Anda membuat proxy seperti itu, batasi skema, blokir IP privat/localhost (SSRF), dan batasi ukuran serta timeout di server.

Tautan `http://` tidak bisa di-fetch dari halaman `https://` (mixed content) dan menampilkan error jaringan yang sama.

### Slot tambahan

```tsx
<FilePicker renderExtra={() => <Button onClick={openFileManager}>File Manager</Button>} />
```

## Terjemahan

Memakai `useTranslate` dari refine dengan default Bahasa Inggris. Key:

`filePicker.text`, `filePicker.orPaste`, `filePicker.maxSize` (`{{max}}`), `filePicker.tooLarge` (`{{name}}`, `{{max}}`), `filePicker.notAccepted`, `filePicker.webcam`, `filePicker.screenCapture`, `filePicker.capture`, `filePicker.retake`, `filePicker.use`, `filePicker.captureFailed`, `filePicker.permissionDenied`, `buttons.cancel`.

Dari URL: `filePicker.fromUrl`, `filePicker.fetch`, `filePicker.urlPlaceholder`, `filePicker.urlInvalid`, `filePicker.urlProtocol`, `filePicker.urlHttp` (`{{status}}`), `filePicker.urlTimeout`, `filePicker.urlTooLarge` (`{{max}}`), `filePicker.urlTooLargeNoMax`, `filePicker.urlNetwork`.

## Catatan

- `disabled` menonaktifkan area drop, `pastable`, dan semua tombol (Take a photo, Capture screen, From URL).
- `<timestamp>` pada nama file hasil generate adalah tanggal ISO dengan `:` dan `.` diganti `-`, mis. `webcam-2026-11-16T10-20-30-123Z.png`.
- Pesan error dan info memakai antd `message` (lewat `message.useMessage()`), jadi komponen tidak perlu berada di dalam antd `<App>`.
- Belum diimplementasikan: lihat [Fitur mendatang](#fitur-mendatang).

## Fitur mendatang

> Rencana / opsional. **Belum diimplementasikan**, jadi API di bawah masih bisa berubah.

### Paste URL global (fase 2 dari `pasteUrl`)

`pasteUrl` saat ini hanya bekerja lewat tombol "From URL". Listener `paste` teks global (paste tautan di mana saja di halaman) **belum diimplementasikan**. Fitur itu butuh guard `document.activeElement` (`input`, `textarea`, `select`, `contenteditable`), karena paste teks ke input adalah hal biasa, berbeda dengan paste file (`pastable`) yang hanya memanggil `preventDefault()` jika clipboard berisi file. Hanya satu FilePicker per halaman yang boleh merespons.

### Ide lain
- Integrasi File Manager lewat `renderExtra`.
- Integrasi Google Drive lewat `renderExtra`.
