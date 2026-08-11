import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import react from "@vitejs/plugin-react-swc";
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import mkcert from 'vite-plugin-mkcert';
// import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
    // rollupOptions: {
    //   onwarn(warning) {
    //     if (warning.message.includes('"use client"')) return
    //   },
    //   output: {
    //     manualChunks(id) {
    //       if (id.includes('node_modules'))
    //         return id
    //           .toString()
    //           .split('node_modules/')[1]
    //           .split('/')[0]
    //           .toString()
    //     },
    //   },
    // },
    // chunkSizeWarningLimit: 500,

    // sourcemap: false,
    // reportCompressedSize: false, // For fast build
    // outDir: './public',
    // emptyOutDir: false,
    // rollupOptions: {
    //   input: '/index.html',
    //   // DEV
    //   // https://vitejs.dev/guide/build#multi-page-app
    //   // input: {
    //   //   main: path.resolve(__dirname, 'index.html'),
    //   //   // Any nested folder (For SSG)
    //   //   nested: path.resolve(__dirname, 'nested/index.html'),
    //   // },
    // },
  },
})
