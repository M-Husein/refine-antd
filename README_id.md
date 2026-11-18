# Refine Antd

[English](README.md) | **Bahasa Indonesia**

![Refine Antd](https://raw.githubusercontent.com/M-Husein/refine-antd/refs/heads/main/public/media/img/vite-refine-antd.jpeg)

## React + TypeScript + Vite + Refine + Antd + Tailwind v3

Template ini menyediakan setup minimal agar React berjalan di Vite dengan HMR dan beberapa aturan ESLint.

Saat ini tersedia dua plugin resmi:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) menggunakan [Babel](https://babeljs.io/) (atau [oxc](https://oxc.rs) jika dipakai di [rolldown-vite](https://vite.dev/guide/rolldown)) untuk Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) menggunakan [SWC](https://swc.rs/) untuk Fast Refresh

## Memulai

Membutuhkan Node.js `^20.19.0` atau `>=22.12.0` (Vite 8). **Bun** adalah package manager default (`bun.lock` adalah satu-satunya lockfile yang di-commit), tetapi **npm** dan **pnpm** juga bisa dipakai.

```bash
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
```

| Package manager | Install | Dev server | Build |
| --- | --- | --- | --- |
| **bun** (default) | `bun install` | `bun run dev` | `bun run build` |
| **npm** | `npm install` | `npm run dev` | `npm run build` |
| **pnpm** | `pnpm install` | `pnpm dev` | `pnpm build` |
| **yarn** | `yarn install` | `yarn dev` | `yarn build` (belum dites) |

- Dev server berjalan di port **5179** dengan sertifikat HTTPS lokal (`vite-plugin-mkcert`), jadi buka `https://localhost:5179`. HTTPS dibutuhkan untuk fitur webcam, screen capture, dan rekaman pada `FilePicker`.
- **Hanya commit `bun.lock`.** `package-lock.json`, `pnpm-lock.yaml`, dan `yarn.lock` dibuat secara lokal saat Anda memakai package manager lain; jangan di-commit.
- Dependensi memakai rentang caret (`^`), jadi tanpa lockfile (npm/pnpm/yarn) versi di-resolve dari rentang tersebut dan bisa berbeda dari `bun.lock`. Jika build gagal hanya di npm/pnpm, bandingkan versi yang terpasang dengan `bun.lock`.
- **Tailwind CSS v3 dan build tools terkaitnya di-pin secara eksak** (`tailwindcss`, `postcss`, `postcss-replace`, `sass`, `autoprefixer`). Project ini memakai Tailwind v3 dan belum mendukung v4, jadi jangan upgrade secara sembarangan (misalnya dengan `bun update --latest` atau `ncu -u`).
- `.npmrc` mengatur `legacy-peer-deps=true`, karena `@emoji-mart/react` mendeklarasikan rentang peer sampai React 18 sementara project ini memakai React 19. Tanpa itu `npm install` gagal dengan `ERESOLVE`. pnpm hanya menampilkan peringatan peer.
- Di Windows, `node_modules` hasil instalasi bun berisi shim bun (`tsc.bunx`, `vite.exe`). Saat berpindah package manager, pindahkan `node_modules` lama ke folder backup lalu install ulang.

## React Compiler

React Compiler diaktifkan pada template ini. Lihat [dokumentasi ini](https://react.dev/learn/react-compiler) untuk informasi lebih lanjut.

Catatan: Ini akan memengaruhi performa dev & build Vite.

## Memperluas konfigurasi ESLint

Jika Anda mengembangkan aplikasi produksi, kami menyarankan memperbarui konfigurasi untuk mengaktifkan aturan lint yang sadar tipe (type-aware):

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

Anda juga bisa memasang [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) dan [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) untuk aturan lint khusus React:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## 📝 Rekomendasi Plugin Vite

| Framework | Plugin Wajib | Plugin yang Direkomendasikan/Menarik |
| :--- | :--- | :--- |
| **General** | `vite-plugin-inspect`<br>`vite-plugin-checker`<br>`vite-plugin-pwa` | `unplugin-auto-import` |
| **React** | `@vitejs/plugin-react` *atau* `@vitejs/plugin-react-swc` | |
| **Vue** | `@vitejs/plugin-vue` | `@vitejs/plugin-vue-jsx`<br>`unplugin-vue-components`<br>`vite-plugin-vue-devtools` |
| **Svelte** | `@sveltejs/vite-plugin-svelte` | `@sveltejs/vite-plugin-svelte-inspector`<br>`@sveltejs/enhanced-img` |
| **Angular** | `@analogjs/vite-plugin-angular` | `@oxc-angular/compiler`<br>`@nitedani/vite-plugin-angular` |

Untuk daftar yang lebih lengkap, repositori (awesome-vite)[https://github.com/vitejs/awesome-vite] yang dikelola komunitas adalah sumber rujukan utamanya.
