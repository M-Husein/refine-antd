/**
 * Image width values. Pure helper shared by the React renderer (ImageFigure), the HTML
 * serializer (renderHTML), the parsers and the Markdown serializer.
 *
 * Why it exists: `width` comes from outside the editor too (stored JSON, pasted HTML,
 * Markdown) and used to be a number of PIXELS (`width: 480`, `width="480"`). Written
 * as-is into CSS, `480` is invalid and the width silently disappears; any free text also
 * ended up inside a `style` attribute. One tolerant reader fixes both.
 */

/** A CSS length the editor accepts: a number with an optional unit (px when omitted). */
const LENGTH = /^(\d+(?:\.\d+)?|\.\d+)(px|%|rem|em|vw|vh|ch)?$/;

/**
 * Returns a safe CSS width, or `null` meaning "no width" (the image keeps its natural size).
 *
 * - `480` or `"480"`            -> `"480px"` (legacy pixel values)
 * - `"50%"`, `"20rem"`, `"30vw"` -> unchanged
 * - `0`, negative, NaN, `"auto"`, `"fit-content"`, `"calc(...)"`, `"50%; x:y"` -> `null`
 */
export const normalizeWidth = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? `${value}px` : null;
  if (typeof value !== "string") return null;

  const match = LENGTH.exec(value.trim());
  if (!match) return null;
  if (!(parseFloat(match[1]) > 0)) return null;
  return `${match[1]}${match[2] ?? "px"}`;
};
