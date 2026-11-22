import type { ImageResponsive, ImageResponsiveKey, ImageResponsiveMode } from "./types";

/**
 * Responsive image width. Pure helpers shared by the React renderer (ImageFigure),
 * the HTML serializer (renderHTML), the parsers and the Markdown serializer, so the
 * rules live in ONE place. No React, no DOM.
 *
 * The matching CSS is in styles/content.css ("Image: responsive width"). Keep the
 * breakpoints below in sync with it.
 */

/** Order used by the editor UI (largest first). */
export const RESPONSIVE_KEYS: readonly ImageResponsiveKey[] = ["md", "sm", "xs"];

export const RESPONSIVE_MIN = 5;
export const RESPONSIVE_MAX = 100;
export const DEFAULT_RESPONSIVE_MODE: ImageResponsiveMode = "container";

export const RESPONSIVE_NAMES: Record<ImageResponsiveKey, string> = {
  md: "Medium",
  sm: "Small",
  xs: "Extra Small",
};

/**
 * Human readable ranges (documentation + editor labels).
 * viewport  = Tailwind screens (sm 640 / md 768 / lg 1024).
 * container = Tailwind container scale (@md 28rem / @2xl 42rem / @4xl 56rem).
 */
export const RESPONSIVE_RANGES: Record<ImageResponsiveMode, Record<ImageResponsiveKey, string>> = {
  viewport: {
    xs: "< 640px",
    sm: "640–767px",
    md: "768–1023px",
  },
  container: {
    xs: "< 28rem (448px)",
    sm: "28rem to < 42rem (448–671px)",
    md: "42rem to < 56rem (672–895px)",
  },
};

/**
 * Where "Large" starts. It has no input of its own: the normal width ("Width (all size)")
 * applies from here up, and to every range that has no value.
 */
export const RESPONSIVE_LARGE: Record<ImageResponsiveMode, string> = {
  viewport: "≥ 1024px",
  container: "≥ 56rem, 896px",
};

/**
 * Which devices each range is meant for, shown under every input in the editor.
 * - viewport: typical devices by window width (CSS px). Phones in landscape and tablets in
 *   portrait overlap (modern phones are ~780-930px wide in landscape, an iPad ~768-834px in
 *   portrait), which is why they share the Medium range.
 * - container: the content width depends on the layout, not on the device, so these are
 *   layout descriptions, not devices.
 * "large" is the normal width ("Width (all size)"): it has no input of its own.
 */
export const RESPONSIVE_DEVICES: Record<ImageResponsiveMode, Record<ImageResponsiveKey | "large", string>> = {
  viewport: {
    xs: "Phones, portrait",
    sm: "Phones, landscape · small tablets",
    md: "Tablets, portrait · large phones, landscape",
    large: "Laptops · desktops · tablets, landscape",
  },
  container: {
    xs: "Narrow column or card (phone-sized)",
    sm: "Narrow column",
    md: "Article-width column (tablet-sized)",
    large: "Wide content area (laptop-sized)",
  },
};

const clampPercent = (n: number) =>
  Math.min(RESPONSIVE_MAX, Math.max(RESPONSIVE_MIN, Math.round(n)));

/**
 * Validates untrusted input (JSON from the outside, parsed HTML, ...). Only the shape
 * `{ mode, xs?, sm?, md? }` with finite numbers survives (a stored `lg` is ignored); numbers are rounded and
 * clamped to 5-100. Returns `null` when no range has a value (nothing to apply).
 */
export const normalizeResponsive = (value: unknown): ImageResponsive | null => {
  if (typeof value !== "object" || value === null) return null;
  const input = value as Record<string, unknown>;

  const out: ImageResponsive = {
    mode: input.mode === "viewport" ? "viewport" : DEFAULT_RESPONSIVE_MODE,
  };
  let any = false;
  for (const key of RESPONSIVE_KEYS) {
    const raw = input[key];
    if (raw === null || raw === undefined || raw === "") continue;
    const n = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(n)) continue;
    out[key] = clampPercent(n);
    any = true;
  }
  return any ? out : null;
};

/** Inline CSS custom properties read by the CSS rules. Empty when there is no responsive width. */
export const responsiveStyleVars = (
  responsive: ImageResponsive | null,
  baseWidth: string,
): Record<string, string> => {
  if (!responsive) return {};
  const vars: Record<string, string> = { "--rte-w-base": baseWidth };
  for (const key of RESPONSIVE_KEYS) {
    const n = responsive[key];
    if (n !== undefined) vars[`--rte-w-${key}`] = `${n}%`;
  }
  return vars;
};

/**
 * Data attributes: `data-rw` (mode, also the CSS selector) and `data-rw-<key>` (the numbers).
 * The numbers are what the parser reads back, so nothing depends on parsing CSS.
 */
export const responsiveDataAttrs = (responsive: ImageResponsive | null): Record<string, string> => {
  if (!responsive) return {};
  const attrs: Record<string, string> = { "data-rw": responsive.mode };
  for (const key of RESPONSIVE_KEYS) {
    const n = responsive[key];
    if (n !== undefined) attrs[`data-rw-${key}`] = String(n);
  }
  return attrs;
};

/** Reads the data attributes back from a figure / img element (browser DOM or zeed-dom). */
export const parseResponsiveFromElement = (
  el: { getAttribute(name: string): string | null } | null | undefined,
): ImageResponsive | null => {
  if (!el) return null;
  const raw: Record<string, unknown> = { mode: el.getAttribute("data-rw") };
  for (const key of RESPONSIVE_KEYS) raw[key] = el.getAttribute(`data-rw-${key}`);
  return normalizeResponsive(raw);
};
