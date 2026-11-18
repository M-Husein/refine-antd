# Refine Antd

**English** | [Bahasa Indonesia](README_id.md)

![Refine Antd](https://raw.githubusercontent.com/M-Husein/refine-antd/refs/heads/main/public/media/img/vite-refine-antd.jpeg)

## React + TypeScript + Vite + Refine + Antd + Tailwind v3

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Getting started

Requires Node.js `^20.19.0` or `>=22.12.0` (Vite 8). **Bun** is the default package manager (`bun.lock` is the only committed lockfile), but **npm** and **pnpm** work too.

```bash
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
```

| Package manager | Install | Dev server | Build |
| --- | --- | --- | --- |
| **bun** (default) | `bun install` | `bun run dev` | `bun run build` |
| **npm** | `npm install` | `npm run dev` | `npm run build` |
| **pnpm** | `pnpm install` | `pnpm dev` | `pnpm build` |
| **yarn** | `yarn install` | `yarn dev` | `yarn build` (not tested) |

- The dev server runs on port **5179** with a local HTTPS certificate (`vite-plugin-mkcert`), so open `https://localhost:5179`. HTTPS is needed for the webcam, screen capture and recording features of `FilePicker`.
- **Only commit `bun.lock`.** `package-lock.json`, `pnpm-lock.yaml` and `yarn.lock` are generated locally when you use another package manager; do not commit them.
- Dependencies use caret ranges (`^`), so without the lockfile (npm/pnpm/yarn) versions are resolved from those ranges and can differ from `bun.lock`. If a build fails only with npm/pnpm, compare the installed versions with `bun.lock`.
- **Tailwind CSS v3 and its related build tools are pinned exactly** (`tailwindcss`, `postcss`, `postcss-replace`, `sass`, `autoprefixer`). This project uses Tailwind v3 and does not support v4 yet, so do not upgrade these blindly (for example with `bun update --latest` or `ncu -u`).
- `.npmrc` sets `legacy-peer-deps=true`, because `@emoji-mart/react` declares a peer range up to React 18 while this project uses React 19. Without it `npm install` fails with `ERESOLVE`. pnpm only prints a peer warning.
- On Windows, a `node_modules` installed by bun contains bun shims (`tsc.bunx`, `vite.exe`). When switching package manager, move the old `node_modules` to a backup folder and install again.

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

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

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

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

## 📝 Vite Plugins Recommendations

| Framework | Must-Have Plugins | Recommended/Notable Plugins |
| :--- | :--- | :--- |
| **General** | `vite-plugin-inspect`<br>`vite-plugin-checker`<br>`vite-plugin-pwa` | `unplugin-auto-import` |
| **React** | `@vitejs/plugin-react` *or* `@vitejs/plugin-react-swc` | |
| **Vue** | `@vitejs/plugin-vue` | `@vitejs/plugin-vue-jsx`<br>`unplugin-vue-components`<br>`vite-plugin-vue-devtools` |
| **Svelte** | `@sveltejs/vite-plugin-svelte` | `@sveltejs/vite-plugin-svelte-inspector`<br>`@sveltejs/enhanced-img` |
| **Angular** | `@analogjs/vite-plugin-angular` | `@oxc-angular/compiler`<br>`@nitedani/vite-plugin-angular` |

For a more extensive list, the community-maintained (awesome-vite)[https://github.com/vitejs/awesome-vite] repository is the definitive resource.
