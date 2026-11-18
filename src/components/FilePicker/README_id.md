# FilePicker

Pembungkus tipis untuk antd [`Upload.Dragger`](https://ant.design/components/upload). **Semua** props dan perilaku `Upload` tetap bisa dipakai (drag & drop, `pastable`, `accept`, `maxCount`, `fileList`, `action`, `onChange`, dll.), ditambah:

- `webcam` – ambil foto dengan kamera
- `screenCapture` – tangkap layar / jendela / tab
- `webcamRecord` – rekam video dengan kamera (dan mikrofon)
- `screenRecord` – rekam video layar / jendela / tab
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
| `webcam`        | `boolean`              | Tampilkan tombol "Ambil foto". Otomatis tersembunyi jika tidak didukung.                                |
| `screenCapture` | `boolean`              | Tampilkan tombol "Tangkap layar". Otomatis tersembunyi jika tidak didukung.                             |
| `webcamRecord`  | `boolean`              | Tampilkan tombol "Record Video" (kamera + mikrofon). Otomatis tersembunyi jika tidak didukung.          |
| `screenRecord`  | `boolean`              | Tampilkan tombol "Record Screen". Otomatis tersembunyi jika tidak didukung.                             |
| `pasteUrl`      | `boolean`              | Tampilkan tombol "From URL": tambah file dengan memasukkan tautan.                                      |
| `fetchUrl`      | `(url, signal) => Promise<Blob>` | Fetch kustom untuk `pasteUrl`, mis. lewat proxy backend untuk mengatasi CORS.                 |
| `urlTimeout`    | `number`               | Timeout fetch URL dalam ms. Default `15000`.                                                            |
| `renderExtra`   | `() => ReactNode`      | Dirender di samping tombol capture.                                                                     |
| `hint`          | `ReactNode`            | Teks di bawah teks utama area drop.                                                                     |
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

### Validasi file
FilePicker hanya memvalidasi **tipe** file (`accept`, termasuk file dari webcam, screen capture, rekaman, dan URL). FilePicker tidak punya batas ukuran atau dimensi sendiri. Lakukan validasi di `beforeUpload` Anda (dipanggil dengan file yang mungkin sudah diganti namanya; kembalikan `Upload.LIST_IGNORE` untuk menolak file), contoh:

```tsx
<FilePicker
  beforeUpload={(file) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error(`${file.name} lebih besar dari 5 MB`);
      return Upload.LIST_IGNORE;
    }
    return true;
  }}
/>
```

Modul validasi khusus sedang direncanakan, lihat [Fitur mendatang](#fitur-mendatang).

### Nama file hasil paste
Rename `pasted-<timestamp>` berlaku untuk file bernama `image.png`/`image.jpg`/... selama `pastable` aktif. Jika `beforeUpload` Anda mengembalikan `false` (tanpa upload), antd memakai file aslinya, sehingga rename tidak berlaku.

### Webcam & screen capture
- Tombol hanya muncul jika `window.isSecureContext` (HTTPS atau `localhost`) dan `navigator.mediaDevices.getUserMedia` / `getDisplayMedia` tersedia.
- Modal menampilkan pratinjau langsung. Tekan **Ambil** (Capture), lalu **Gunakan** (Use) atau **Ulangi** (Retake).
- Hasilnya adalah `File` (`webcam-<timestamp>.png` / `screen-<timestamp>.png`) yang melewati alur antd seperti biasa (`accept`, `maxCount`, `beforeUpload`, `action`, `onChange`), sama seperti file yang dipilih dari disk.
- Pratinjau webcam ter-mirror (tampilan selfie) dan foto yang disimpan juga ter-mirror, sehingga sama dengan yang terlihat. Screen capture tidak pernah di-mirror.
- File hasil capture dicek terhadap `accept` sebelum masuk ke alur antd. Jika tidak cocok, error ditampilkan dan tidak ada yang ditambahkan.
- Jika izin ditolak (webcam) atau perangkat tidak bisa dibuka, pesan error ditampilkan dan modal ditutup. Membatalkan dialog pilih layar menutup modal tanpa pesan.
- Stream media selalu dimatikan saat modal ditutup (termasuk saat ditutup ketika browser masih meminta izin), sehingga indikator kamera/layar mati.

### Rekam video (`webcamRecord` & `screenRecord`)
- Tombol hanya muncul jika syarat yang sama dengan webcam/screen capture terpenuhi **dan** browser punya `MediaRecorder`.
- Modal menampilkan pratinjau langsung. Tekan **Start Recording**, lalu **Stop Recording**, tinjau videonya, dan pilih **Use** atau **Retake**.
- **Countdown:** setelah menekan **Start Recording** (webcam atau layar), countdown besar 3 → 2 → 1 ditampilkan (seperti Snipping Tool Windows 11) sebelum rekaman dimulai, sehingga ada waktu bersiap atau berpindah ke jendela yang ingin direkam. **Cancel** saat countdown membatalkannya. Jika Anda membagikan tab saat ini, overlay countdown bisa muncul di beberapa detik pertama rekaman.
- **File ter-mirror:** rekaman webcam ter-mirror **di dalam file yang disimpan** (bukan hanya di pratinjau). Frame dibalik di `<canvas>` dan canvas itu direkam bersama audio mikrofon. Rekaman layar tidak pernah di-mirror.
- Format: yang pertama didukung dari `video/webm;codecs=vp9,opus`, `vp8,opus`, `video/webm`, `video/mp4` (Safari). Nama file: `webcam-record-<timestamp>.webm` / `screen-record-<timestamp>.webm` (`.mp4` jika browser merekam mp4).
- Hasilnya `File` biasa, sehingga melewati `accept`, `maxCount`, `beforeUpload`, `action` dan `onChange`. Pastikan `accept` mengizinkan `video/*`, kalau tidak rekaman akan ditolak.
- Tidak ada mikrofon? Rekaman webcam tetap berjalan tanpa suara dan peringatan ditampilkan. Jika mikrofon hanya ditolak, browser menolak kamera dan mikrofon sekaligus, sehingga muncul error "Permission denied.".
- Jika pengguna menekan "Stop sharing" dari browser saat merekam layar, rekaman dihentikan dan ditampilkan untuk ditinjau, bukan hilang.
- Keterbatasan: rekaman webcam membeku selama tab browser tersembunyi (loop mirror memakai `requestAnimationFrame`).

### Dari URL (`pasteUrl`)
- Tombol **From URL** membuka modal berisi input. Tekan **Enter** atau **Add** untuk mengambil tautan. **Cancel**/tutup modal membatalkan request yang sedang berjalan.
- Alur: validasi URL (hanya `http:`/`https:`) → `fetch` dengan timeout (`urlTimeout`) → cek `res.ok` → cek tipe terhadap `accept` → ditambahkan sebagai `File`. Setelah itu melewati alur antd seperti biasa (`accept`, `maxCount`, `beforeUpload`, `action`, `onChange`).
- Nama file: header `Content-Disposition`, jika tidak ada maka segmen terakhir path URL, jika tidak ada maka `url-<timestamp>.<ext>`.
- Tipe file: `Content-Type` dari respons. Jika server tidak mengirimnya (atau `application/octet-stream`), tipe ditebak dari ekstensi file.
- Error ditampilkan di dalam modal: URL tidak valid, protokol tidak didukung, error HTTP (dengan status), timeout, tipe tidak diterima, dan kegagalan jaringan/CORS.
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

`filePicker.text`, `filePicker.orPaste`, `filePicker.notAccepted`, `filePicker.webcam`, `filePicker.screenCapture`, `filePicker.capture`, `filePicker.retake`, `filePicker.use`, `filePicker.captureFailed`, `filePicker.permissionDenied`, `buttons.cancel`.

Rekam: `filePicker.webcamRecord`, `filePicker.screenRecord`, `filePicker.startRecording`, `filePicker.stopRecording`, `filePicker.noMicrophone`, `filePicker.recordNotSupported`.

Dari URL: `filePicker.fromUrl`, `filePicker.fetch`, `filePicker.urlPlaceholder`, `filePicker.urlInvalid`, `filePicker.urlProtocol`, `filePicker.urlHttp` (`{{status}}`), `filePicker.urlTimeout`, `filePicker.urlNetwork`.

## Catatan

- `disabled` menonaktifkan area drop, `pastable`, dan semua tombol (Take a photo, Capture screen, From URL).
- `<timestamp>` pada nama file hasil generate adalah tanggal ISO dengan `:` dan `.` diganti `-`, mis. `webcam-2026-11-16T10-20-30-123Z.png`.
- Pesan error dan info memakai antd `message` (lewat `message.useMessage()`), jadi komponen tidak perlu berada di dalam antd `<App>`.
- Belum diimplementasikan: lihat [Fitur mendatang](#fitur-mendatang).

## Fitur mendatang

> Rencana / opsional. **Belum diimplementasikan**, jadi API di bawah masih bisa berubah.

### Modul validasi file (terpisah dari FilePicker)

`maxBytes` sengaja **dihapus** dari FilePicker. Validasi file yang spesifik akan dibuat sebagai **function/modul terpisah** yang bisa dipakai dengan `Upload`/FilePicker apa pun, bukan dengan menambah jumlah props FilePicker.

Aturan yang direncanakan:
- Ukuran: `maxBytes` / `minBytes`.
- Gambar: `maxWidth` / `minWidth` / `maxHeight` / `minHeight` (dan opsional rasio aspek).
- Video: batas dimensi yang sama, ditambah `maxDuration` / `minDuration`.
- Mungkin: allow-list ekstensi/MIME, pola nama file.

Catatan desain (usulan):
- Semua sumber (disk, drag & drop, paste, webcam, screen capture, rekaman, URL) melewati `beforeUpload`, jadi satu validator mencakup semuanya.
- Validator yang bisa dikomposisi, mengembalikan hasil yang kompatibel dengan `beforeUpload` (`true` / `Upload.LIST_IGNORE` / promise yang ditolak), dan melaporkan error dengan pesan i18n.
- Dimensi dan durasi dibaca secara asinkron dari file (metadata `Image` / `<video>` lewat object URL yang di-revoke setelahnya), jadi validatornya async.

Sketsa (belum final):

```tsx
<FilePicker
  beforeUpload={createFileValidator([
    maxBytes(5 * 1024 * 1024),
    imageSize({ minWidth: 200, maxWidth: 4000, minHeight: 200 }),
    videoDuration({ maxSeconds: 60 }),
  ])}
/>
```

### Paste URL global (fase 2 dari `pasteUrl`)

`pasteUrl` saat ini hanya bekerja lewat tombol "From URL". Listener `paste` teks global (paste tautan di mana saja di halaman) **belum diimplementasikan**. Fitur itu butuh guard `document.activeElement` (`input`, `textarea`, `select`, `contenteditable`), karena paste teks ke input adalah hal biasa, berbeda dengan paste file (`pastable`) yang hanya memanggil `preventDefault()` jika clipboard berisi file. Hanya satu FilePicker per halaman yang boleh merespons.

### Ide lain
- Integrasi File Manager lewat `renderExtra`.
- Integrasi Google Drive lewat `renderExtra`.
