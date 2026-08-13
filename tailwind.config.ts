// import type { Config } from 'tailwindcss';
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
      // You can also override RFS settings via theme if needed
      rfs: {
        baseValue: '1.25rem',
        breakpoint: '1200px',
        factor: '10',
        unit: 'rem',
      },
      zIndex: {
        '1': '1',
        '2': '2',
        '301': '301',
        '1051': '1051',
        '1052': '1052',
      },
      // spacing: {
        
      // },
      fontSize: {
        '13': '13px', 
      },
      // backgroundColor
      colors: {
        /**
         * From https://getbootstrap.com/docs/5.3/utilities/text/#reset-color
         */
        'reset': 'inherit !important',

        // 'orange1': '#ff7a00',
      },
      gridTemplateColumns: {
        'auto-1fr': 'auto 1fr',
      },
    },
  },
  plugins: [
    // Custom
    plugin(({ addUtilities }) => {
      addUtilities({
        '.scrollbar-gutter-auto': {
          'scrollbar-gutter': 'auto',
        },
        '.scrollbar-gutter-stable': {
          'scrollbar-gutter': 'stable',
        },
        '.scrollbar-gutter-both': {
          'scrollbar-gutter': 'stable both-edges',
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

        '.disabled': {
          'pointer-events': 'none',
          'user-select': 'none',
          // 'interactivity': 'inert',
          '-webkit-user-drag': 'none',
          'opacity': '.4',
        },

        '.no-shadow': {
          'box-shadow': 'none !important',
        },

        '.mirror': {
          'transform': 'scaleX(-1)', // rotateY(180deg)
        },
      });
    }),

    // Typography plugin (Bootstrap-style with RFS)
    plugin(({ addBase, addUtilities }) => {
      const headingSelectors = [
        { selector: 'h1,.h1', fontSize: '2.5rem' },
        { selector: 'h2,.h2', fontSize: '2rem' },
        { selector: 'h3,.h3', fontSize: '1.75rem' },
        { selector: 'h4,.h4', fontSize: '1.5rem' },
        { selector: 'h5,.h5', fontSize: '1.25rem' },
        { selector: 'h6,.h6', fontSize: '1rem' },
        { selector: '.small,small', fontSize: '.875em' },
      ];

      const otherUtilities = {
        '.display-1': { fontSize: '5rem' }, // , fontWeight: '300', lineHeight: '1.2'
        '.display-2': { fontSize: '4.5rem' }, // , fontWeight: '300', lineHeight: '1.2'
        '.display-3': { fontSize: '4rem' }, // , fontWeight: '300', lineHeight: '1.2'
        '.display-4': { fontSize: '3.5rem' }, // , fontWeight: '300', lineHeight: '1.2'
        '.display-5': { fontSize: '3rem' }, // , fontWeight: '300', lineHeight: '1.2'
        '.display-6': { fontSize: '2.5rem' }, // , fontWeight: '300', lineHeight: '1.2'
        '.lead': { fontSize: '1.25rem', fontWeight: '300' }, // , lineHeight: '1.5'
        // '.small,small': { fontSize: '.875em' },
        '.fs-1': { fontSize: '2.5rem' },
        '.fs-2': { fontSize: '2rem' },
        '.fs-3': { fontSize: '1.75rem' },
        '.fs-4': { fontSize: '1.5rem' },
        '.fs-5': { fontSize: '1.25rem' },
        '.fs-6': { fontSize: '1rem' },
      };

      const baseStyles: Record<string, any> = {};
      for (const item of headingSelectors) {
        baseStyles[item.selector] = {
          'font-size': `rfs(${item.fontSize})`,
        };
      }
      addBase(baseStyles);

      const utilityStyles: Record<string, any> = {};
      for (const [selector, rule] of Object.entries(otherUtilities)) {
        const cssRule: any = {
          'font-size': `rfs(${rule.fontSize})`,
        };
        if ('fontWeight' in rule) {
          cssRule['font-weight'] = rule.fontWeight;
        }
        if ('lineHeight' in rule) {
          cssRule['line-height'] = rule.lineHeight;
        }
        utilityStyles[selector] = cssRule;
      }
      addUtilities(utilityStyles);
    })
  ],
}
