export default {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},

    // RFS plugin
    rfs: {
      // Optional: customize RFS defaults
      baseValue: '1.25rem',   // default
      breakpoint: '1200px',   // default
      factor: 10,             // default
      unit: 'rem',            // default
      twoDimensional: false,  // default
    },
    
    autoprefixer: {},

    // Custom replacement plugin - keep it after all transformations
    'postcss-replace': {
      pattern: /(--tw|\*, ::before, ::after)/g,
      data: {
        '--tw': '--t', // Prefixing
        '*, ::before, ::after': ':root', // So variables does not pollute every element
      }
    },
  },
}

/**
 * Order matters:
 * 
 * - postcss-import first (resolves @import rules).
 * - tailwindcss generates the final utility classes.
 * - rfs transforms the rfs(...) function into fluid CSS.
 * - autoprefixer adds vendor prefixes.
 * - postcss-replace last for your custom overrides.
 */
