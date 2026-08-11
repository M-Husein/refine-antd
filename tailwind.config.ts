import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  separator: '_',
  content: [
    "./index.html",
    // "./tailwind_safelist.html", // For always compile some class
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // blocklist: [],
  // safelist: [],
  theme: {
    extend: {
      zIndex: {
        '1': '1',
        '2': '2',
        '301': '301',
        '1051': '1051',
        '1052': '1052',
      },
      spacing: {
        
      },
      fontSize: {
        '13': '13px', 
      },
      // backgroundColor
      // colors: {
      //   'orange1': '#ff7a00',
      // },
      gridTemplateColumns: {
        'auto-1fr': 'auto 1fr',
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.scrollbar-gutter-auto': {
          'scrollbar-gutter': 'auto' 
        },
        '.scrollbar-gutter-stable': { 
          'scrollbar-gutter': 'stable' 
        },
        '.scrollbar-gutter-both': { 
          'scrollbar-gutter': 'stable both-edges' 
        },

        '.content-v-hide': {
          'content-visibility': 'hidden',
        },
        '.content-v-auto': {
          'content-visibility': 'auto',
        },
        '.content-v-visible': {
          'content-visibility': 'visible',
        },
      })
    })
  ],
}
