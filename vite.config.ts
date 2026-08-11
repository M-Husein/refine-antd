import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
import react from "@vitejs/plugin-react-swc";
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import mkcert from 'vite-plugin-mkcert';
// import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const htmlTransformPlugin = () => {
  return {
    name: 'html-transform',
    // The 'transformIndexHtml' hook allows us to modify the HTML
    transformIndexHtml(html: string) {
      // During development, we want to keep the path to the source CSS file
      if (process.env.NODE_ENV !== 'production') {
        return html.replace('%CSS_URL%', '/src/styles/core.css');
      }

      // In production, we read the manifest to get the hashed filename
      try {
        const manifestPath = path.resolve(__dirname, 'dist/manifest.json');
        // Check if manifest exists to avoid errors during the first build
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          // The key is the source path of your CSS file
          const cssEntry = manifest['src/styles/core.css'];
          if (cssEntry) {
            // The manifest contains the hashed filename, e.g., "assets/core.abc123.css"
            const hashedCssFile = cssEntry.file;
            // Replace the placeholder with the correct path
            return html.replace('%CSS_URL%', '/' + hashedCssFile);
          }
        }
      } catch (e) {
        console.warn('Could not read manifest for CSS injection:', e);
      }

      // Fallback: if something goes wrong, return the HTML unchanged
      return html;
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(
      /**
       * https://react.dev/reference/react-compiler/compiling-libraries#why-ship-compiled-code
       */
      // {
      //   babel: {
      //     plugins: [['babel-plugin-react-compiler']],
      //   },
      // } as any
    ),
    htmlTransformPlugin(),
    mkcert(),
    // svgr({
    //   svgrOptions: {
    //     exportType: "named", // 👈 use named export (ReactComponent)
    //     ref: true,
    //     titleProp: true,
    //   },
    //   include: '**/*.svg',
    // }),
    // input https://www.npmjs.com/package/html-minifier-terser options
    ViteMinifyPlugin({
      // Tell html-minifier-terser to minify JSON-LD scripts
      processScripts: ['application/ld+json'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5179, // Default = 5173
    /** @DOCS : https://vitejs.dev/config/server-options.html#server-strictport */
    // strictPort: true, // Default = false
    host: true,
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // drop_console: true, //
        arrows: true,       // Converts functions to arrow functions
        comparisons: true,  // Optimizes `typeof` checks, if false will Disables '==' optimization
        conditionals: true, // Flattens nested ternaries
        toplevel: true,     // Minifies top-level functions
      },
      format: {
        comments: false, // Removes comments
      },
    },
    rollupOptions: {
      input: {
        main: 'src/main.tsx',
        app: 'src/styles/core.css',
      },
      output: {
        assetFileNames: 'assets/core.css', // fixed name
      },
    },
  },
})
