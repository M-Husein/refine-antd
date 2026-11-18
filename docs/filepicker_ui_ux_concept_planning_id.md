# 🧠 Master Blueprint & Konsep Desain: `FilePicker` Component

Dokumen ini berisi spesifikasi arsitektur, desain interaksi, aturan aksesibilitas, dan kontrak API untuk komponen **`FilePicker`** modular yang mendukung berbagai metode input file (native, drag-and-drop, webcam, screen capture, smart paste) serta siap dikembangkan untuk integrasi masa depan (File Manager & Cloud Storage).

---

## 1. Filosofi Desain & Tata Letak (UI/UX Blueprint)

Komponen menggunakan pendekatan **Progressive Disclosure** agar antarmuka tetap bersih (*clean*) dan tidak penuh sesak:

* **Zona Utama (Primary Focus):** Area *Dropzone* terpadu yang lebar untuk aksi paling umum (klik pilih file dari disk atau *drag-and-drop*).
* **Baris Aksi Sekunder (Secondary Action Bar):** Tombol tangkapan perangkat (Kamera/Selfie, Screen Capture) diletakkan secara rapi di bawah area utama menggunakan *flexbox*. Tombol ini akan otomatis tersembunyi (*graceful degradation*) jika perangkat/browser tidak mendukung atau berada di luar konteks aman (`HTTPS` / `localhost`).
* **Slot Ekstensi Masa Depan:** Disediakan *render prop* (`renderExtra`) untuk menyisipkan fitur masa depan (seperti File Manager atau integrasi Google Drive API) tanpa merusak struktur layout utama.

---

## 2. Rincian Fitur & Perilaku Sistem (Behavior Specs)

### A. Fitur 1 & 2: Native Input & Drag-and-Drop
* **Default State:** Border putus-putus (`dashed`) dengan warna netral dan latar belakang lembut. Seluruh area responsif terhadap klik untuk memicu `<input type="file">`.
* **Drag-Over State:** Saat file diseret di atas area, border berubah menjadi *solid* dengan warna primer dan latar belakang menyala.
* **Validasi Standar:** Setiap file yang masuk (baik dari klik maupun drag) divalidasi terhadap batasan tipe file (`accept`), ukuran maksimal (`maxBytes`), dan jumlah maksimum file (`maxFiles`).

### B. Fitur 3 & 4: Webcam Selfie & Screen Capture Modal
* **Feature Detection:** Komponen memeriksa keberadaan `navigator.mediaDevices.getUserMedia` (webcam) dan `getDisplayMedia` (screen capture) secara aman untuk mencegah *error* di browser yang tidak mendukung.
* **Modal Viewfinder & Review Flow:** 
  1. Tombol memicu modal pratinjau *live stream*.
  2. Pengguna mengambil tangkapan layar/foto.
  3. Sistem mengubah *frame* menjadi objek `File` standar yang langsung dimasukkan ke antrean state file utama.
  4. Stream media otomatis dimatikan (*cleanup*) saat modal ditutup untuk mematikan indikator lampu kamera/layar.

### C. Fitur Spesial: Smart Paste (`paste={true}`)
* **Kontrol Prop:** Fitur aktif hanya jika prop `paste={true}` diberikan oleh developer.
* **Active Element Guard (Pencegahan Konflik):** Sistem wajib memeriksa `document.activeElement` sebelum memproses clipboard. Jika fokus sedang aktif di dalam `<input>`, `<textarea>`, `<select>`, atau elemen dengan atribut `contenteditable="true"`, aksi paste **diabaikan** agar tidak mengganggu pengetikan teks biasa.
* **3 Skenario Sumber Clipboard:**
  1. **File Langsung:** Salinan file dari File Explorer (Windows/Mac).
  2. **Gambar Clipboard:** Hasil *screenshot* atau *Copy Image* dari browser (otomatis dinamai dengan *timestamp*).
  3. **URL / Tautan Teks:** Jika teks berupa URL dan cocok dengan parameter `accept`, sistem otomatis melakukan `fetch()`, mengubahnya menjadi `Blob/File`, lalu memasukkannya ke antrean.

---

## 3. Standar Aksesibilitas (a11y) & Keamanan

* **Aksesibilitas Keyboard:** Dropzone utama memiliki atribut interaktif (`role="button"`, `tabIndex={0}`) sehingga pengguna dapat menekan tombol `Enter` atau `Space` untuk membuka dialog file.
* **Screen Reader Live Region:** Menggunakan kontainer `aria-live="polite"` untuk mengumumkan status perubahan file (berhasil ditambah atau galat) kepada pembaca layar.
* **Target Sentuh:** Seluruh tombol aksi dirancang dengan ukuran minimum yang nyaman disentuh di perangkat seluler maupun desktop.

---

## 4. Kontrak API & Struktur Props (`FilePickerProps`)

Berikut adalah struktur parameter final yang bersih dan modern berdasarkan preferensi Anda:

```typescript
export type FileSource = 'local' | 'drag-drop' | 'webcam' | 'screen-capture' | 'file-manager' | 'google-drive';

export interface FileItem {
  id: string;
  file: File;
  previewUrl?: string;
  source: FileSource;
}

export interface FilePickerProps {
  value?: FileItem[];
  onChange?: (files: FileItem[]) => void;
  accept?: string;                  // Contoh: "image/*,.pdf,application/json"
  multiple?: boolean;
  maxBytes?: number;                // Batas ukuran maksimal file dalam bytes
  maxFiles?: number;                // Batas jumlah file
  
  // --- Feature Control Flags ---
  paste?: boolean;                  // Mengaktifkan fitur smart paste dari clipboard
  webcam?: boolean;                 // Mengaktifkan tombol & fitur kamera/selfie
  screenCapture?: boolean;          // Mengaktifkan tombol & fitur tangkapan layar
  
  // --- Future Expansion Slot (Fitur 5 & 6) ---
  renderExtra?: () => React.ReactNode; // Slot render kustom untuk tombol masa depan (File Manager / Google Drive)
  
  disabled?: boolean;
  error?: string;
}
```
