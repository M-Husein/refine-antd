/**
 * Emits an inline `style` from a node/mark's `renderHTML` in a way that
 * survives *static* HTML generation (jsonToHtml / `@tiptap/html`'s
 * `generateHTML`), not just the live browser DOM.
 *
 * Why a plain `{ style: "..." }` isn't enough: ProseMirror's
 * `DOMSerializer` special-cases the exact attribute name `"style"` and
 * applies it with `dom.style.cssText = value` instead of `setAttribute`.
 * `generateHTML` serializes into zeed-dom (a lightweight DOM that runs
 * without a browser), whose `style` object silently ignores `cssText`
 * assignment — so any `style` returned from `renderHTML` vanished from
 * exported HTML. (This is how `ImageInline`'s `vertical-align` was being
 * lost on a JSON -> HTML -> JSON round trip, and how the Embed's
 * responsive wrapper lost its aspect ratio.)
 *
 * The workaround is the attribute name itself: `"STYLE"` is not the
 * string ProseMirror special-cases, so it falls through to a normal
 * `setAttribute`. HTML attribute names are case-insensitive, so browsers
 * (which lowercase names in `setAttribute` on an HTML document) and HTML
 * parsers (zeed-dom's included, verified on re-parse) treat it exactly
 * like `style`. The raw output of `generateHTML` therefore contains the
 * literal text `STYLE="..."` — valid, just uppercase. `jsonToHtml` tidies
 * that up with `compactHtmlStyles` below, which only touches text INSIDE
 * tags, so user text that happens to contain ` STYLE="` is never changed.
 */
export const styleAttrs = (css?: string | null): Record<string, string> =>
  css ? { STYLE: css } : {};

/**
 * Compacts the declarations of an inline style: no spaces after `:` or `;`,
 * and no trailing `;`.
 *
 *   "max-width: 100%; height: auto;"  ->  "max-width:100%;height:auto"
 *
 * Spaces INSIDE a value are kept (`margin: 0 1rem`), and a `;` that does not end a
 * declaration is left alone: inside parentheses (`url(data:image/png;base64,...)`),
 * inside quotes, and as the end of an HTML entity (`&quot;`).
 */
export const compactStyle = (css: string): string => {
  const declarations: string[] = [];
  let current = "";
  let depth = 0;
  let quote: string | null = null;

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];

    if (quote) {
      current += ch;
      if (ch === quote && css[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "&") {
      const entity = /^&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i.exec(css.slice(i));
      if (entity) {
        current += entity[0];
        i += entity[0].length - 1;
        continue;
      }
    }
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);

    if (ch === ";" && depth === 0) {
      declarations.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  declarations.push(current);

  return declarations
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const colon = d.indexOf(":");
      return colon < 0 ? d : `${d.slice(0, colon).trim()}:${d.slice(colon + 1).trim()}`;
    })
    .join(";");
};

const HTML_TAG = /<[a-zA-Z][^<>]*>/g;
const STYLE_ATTR = /(\s)style=("[^"]*"|'[^']*')/gi;

/**
 * Applies `compactStyle` to every `style` / `STYLE` attribute of an HTML string and writes
 * the attribute name in lowercase. It only looks INSIDE tags (text content is escaped by the
 * serializer, so a literal `<` never appears there); a tag it cannot match is left as it is.
 */
export const compactHtmlStyles = (html: string): string =>
  html.replace(HTML_TAG, (tag) =>
    tag.replace(STYLE_ATTR, (_match, space: string, quoted: string) => {
      const quote = quoted[0];
      return `${space}style=${quote}${compactStyle(quoted.slice(1, -1))}${quote}`;
    }),
  );
