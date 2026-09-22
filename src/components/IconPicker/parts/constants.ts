const addSkins = (path: string) => (item: any) => ({
  ...item,
  skins: [{ src: `/media/icons/${path}/${item.id}.svg` }],
});

/**
 * IconPicker custom
 */
export const customData = [
  {
    id: "html_symbols",
    name: "Special Characters, HTML Symbols, etc",
    emojis: [
      // Formatting & Spaces
      // { id: 'nbsp', name: 'Non-breaking space', keywords: ['space', 'formatting', 'nbsp'], skins: [{ native: '\u00A0' }] },
      // { id: 'ensp', name: 'En space', keywords: ['space', 'formatting', 'ensp'], skins: [{ native: '\u2002' }] },
      // { id: 'emsp', name: 'Em space', keywords: ['space', 'formatting', 'emsp'], skins: [{ native: '\u2003' }] },
      // { id: 'thinsp', name: 'Thin space', keywords: ['space', 'formatting', 'thinsp'], skins: [{ native: '\u2009' }] },

      // HTML Reserved & Syntax
      {
        id: "lt",
        name: "Less-than",
        keywords: ["html", "syntax", "less", "lt"],
        skins: [{ native: "<" }],
      },
      {
        id: "gt",
        name: "Greater-than",
        keywords: ["html", "syntax", "greater", "gt"],
        skins: [{ native: ">" }],
      },
      {
        id: "amp",
        name: "Ampersand",
        keywords: ["html", "syntax", "ampersand", "amp"],
        skins: [{ native: "&" }],
      },
      {
        id: "quot",
        name: "Double quotation mark",
        keywords: ["quote", "syntax", "quot"],
        skins: [{ native: '"' }],
      },
      {
        id: "apos",
        name: "Single quotation mark / Apostrophe",
        keywords: ["quote", "apostrophe", "apos"],
        skins: [{ native: "'" }],
      },

      // Currency Symbols (Not present in default Emoji set)
      {
        id: "cent",
        name: "Cent sign",
        keywords: ["currency", "money", "cent"],
        skins: [{ native: "¢" }],
      },
      {
        id: "pound",
        name: "Pound sign",
        keywords: ["currency", "money", "pound"],
        skins: [{ native: "£" }],
      },

      // Typography & Punctuation
      {
        id: "mdash",
        name: "Em dash",
        keywords: ["punctuation", "dash", "mdash"],
        skins: [{ native: "—" }],
      },
      {
        id: "ndash",
        name: "En dash",
        keywords: ["punctuation", "dash", "ndash"],
        skins: [{ native: "–" }],
      },
      {
        id: "ldquo",
        name: "Left double quotation mark",
        keywords: ["quote", "punctuation"],
        skins: [{ native: "“" }],
      },
      {
        id: "rdquo",
        name: "Right double quotation mark",
        keywords: ["quote", "punctuation"],
        skins: [{ native: "”" }],
      },
      {
        id: "lsquo",
        name: "Left single quotation mark",
        keywords: ["quote", "punctuation"],
        skins: [{ native: "‘" }],
      },
      {
        id: "rsquo",
        name: "Right single quotation mark",
        keywords: ["quote", "punctuation"],
        skins: [{ native: "’" }],
      },
      {
        id: "hellip",
        name: "Standard Horizontal Ellipsis (Baseline)",
        keywords: ["punctuation", "dots", "ellipsis", "horizontal"],
        skins: [{ native: "…" }],
      },
      {
        id: "ctdot",
        name: "Midline Horizontal Ellipsis (Centered)",
        keywords: ["punctuation", "dots", "ellipsis", "middle"],
        skins: [{ native: "⋯" }],
      },
      {
        id: "vellip",
        name: "Vertical Ellipsis",
        keywords: ["punctuation", "dots", "ellipsis", "vertical"],
        skins: [{ native: "⋮" }],
      },
      {
        id: "bull",
        name: "Bullet",
        keywords: ["punctuation", "bullet"],
        skins: [{ native: "•" }],
      },
      {
        id: "para",
        name: "Paragraph sign",
        keywords: ["punctuation", "paragraph"],
        skins: [{ native: "¶" }],
      },
      {
        id: "sect",
        name: "Section sign",
        keywords: ["punctuation", "section"],
        skins: [{ native: "§" }],
      },

      // Mathematical Symbols
      {
        id: "plusmn",
        name: "Plus-minus sign",
        keywords: ["math", "plus", "minus"],
        skins: [{ native: "±" }],
      },
      {
        id: "times",
        name: "Multiplication sign",
        keywords: ["math", "multiply", "times"],
        skins: [{ native: "×" }],
      },
      {
        id: "divide",
        name: "Division sign",
        keywords: ["math", "divide"],
        skins: [{ native: "÷" }],
      },
      {
        id: "ne",
        name: "Not equal to",
        keywords: ["math", "equal", "ne"],
        skins: [{ native: "≠" }],
      },
      {
        id: "approx",
        name: "Almost equal to",
        keywords: ["math", "approximate"],
        skins: [{ native: "≈" }],
      },
      {
        id: "le",
        name: "Less-than or equal to",
        keywords: ["math", "less"],
        skins: [{ native: "≤" }],
      },
      {
        id: "ge",
        name: "Greater-than or equal to",
        keywords: ["math", "greater"],
        skins: [{ native: "≥" }],
      },
      {
        id: "infin",
        name: "Infinity",
        keywords: ["math", "infinity"],
        skins: [{ native: "∞" }],
      },
      {
        id: "radic",
        name: "Square root",
        keywords: ["math", "root", "radic"],
        skins: [{ native: "√" }],
      },
      {
        id: "frac12",
        name: "Fraction one half",
        keywords: ["math", "fraction", "half"],
        skins: [{ native: "½" }],
      },
      {
        id: "frac14",
        name: "Fraction one quarter",
        keywords: ["math", "fraction", "quarter"],
        skins: [{ native: "¼" }],
      },
      {
        id: "frac34",
        name: "Fraction three quarters",
        keywords: ["math", "fraction"],
        skins: [{ native: "¾" }],
      },
      {
        id: "deg",
        name: "Degree sign",
        keywords: ["math", "degree", "temperature"],
        skins: [{ native: "°" }],
      },

      // Arrows (Plain HTML arrows not included in standard emoji sets)
      {
        id: "larr",
        name: "Leftward arrow",
        keywords: ["arrow", "left"],
        skins: [{ native: "←" }],
      },
      {
        id: "uarr",
        name: "Upward arrow",
        keywords: ["arrow", "up"],
        skins: [{ native: "↑" }],
      },
      {
        id: "rarr",
        name: "Rightward arrow",
        keywords: ["arrow", "right"],
        skins: [{ native: "→" }],
      },
      {
        id: "darr",
        name: "Downward arrow",
        keywords: ["arrow", "down"],
        skins: [{ native: "↓" }],
      },
      {
        id: "harr",
        name: "Left right arrow",
        keywords: ["arrow", "horizontal"],
        skins: [{ native: "↔" }],
      },

      // {
      //   id: "xxxxxxx",
      //   name: "Just Testing",
      //   keywords: ["test"],
      //   skins: [{ native: "Long Text Nih" }],
      // },
    ],
  },

  {
    id: 'brands',
    name: 'Brands',
    emojis: [
      {
        id: 'android',
        name: 'Android',
        keywords: ['android', 'robot'],
        // skins: [{ src: '/media/icons/brands/android.svg' }],
      },
      {
        id: 'apple',
        name: 'Apple',
        keywords: ['apple', 'ios'],
      },
      // {
      //   id: 'app-store',
      //   name: 'App Store',
      //   keywords: ['app-store', 'apple', 'ios'],
      // },
      {
        id: 'facebook',
        name: 'Facebook',
        keywords: ['facebook'],
      },
      // {
      //   id: 'figma',
      //   name: 'Figma',
      //   keywords: ['figma'],
      // },
      {
        id: 'google',
        name: 'Google',
        keywords: ['google'],
      },
      {
        id: 'instagram',
        name: 'Instagram',
        keywords: ['instagram'],
      },
      {
        id: 'linkedin',
        name: 'Linkedin',
        keywords: ['linkedin'],
      },
      {
        id: 'telegram',
        name: 'Telegram',
        keywords: ['telegram'],
      },
      {
        id: 'tiktok',
        name: 'Tiktok',
        keywords: ['tiktok'],
      },
      {
        id: 'twitter',
        name: 'Twitter',
        keywords: ['twitter'],
      },
      {
        id: 'whatsapp',
        name: 'Whatsapp',
        keywords: ['whatsapp'],
      },
      {
        id: 'youtube',
        name: 'Youtube',
        keywords: ['youtube'],
      },
      // {
      //   id: 'zoom',
      //   name: 'Zoom',
      //   keywords: ['zoom'],
      // },
    ].map(addSkins('colorful/brands')),
  },

  // {
  //   id: 'etc',
  //   name: 'Etc',
  //   emojis: [
  //     {
  //       id: 'book-open',
  //       name: 'Book Open',
  //       keywords: ['book', 'open'],
  //     },
  //     {
  //       id: 'experiment',
  //       name: 'Experiment',
  //       keywords: ['experiment', 'lab'],
  //     },
  //     {
  //       id: 'math',
  //       name: 'Math',
  //       keywords: ['math', 'calc'],
  //     },
  //     {
  //       id: 'target',
  //       name: 'Target',
  //       keywords: ['target', 'bullseye'],
  //     },
  //   ].map(addSkins('etc')),
  // }
];

