export type ImageDisplayMode = "block" | "float-left" | "float-right";
export type ImageAlign = "left" | "center" | "right";
export type ImageVerticalAlign = "baseline" | "top" | "middle" | "bottom";

export type ImageWidth = string | number | null;
/**
 * What the responsive widths are measured against:
 * - "container": the width of the editor/viewer content box (`.rte-content`, a named CSS container)
 * - "viewport": the browser window width
 */
export type ImageResponsiveMode = "container" | "viewport";
export type ImageResponsiveKey = "xs" | "sm" | "md";

/**
 * Per-range image width in percent (integers 5-100). Each range applies only to itself
 * (no inheritance between ranges); an empty range uses the normal `width`.
 *
 * There is no "large" range on purpose: the normal `width` ("Width (all size)" in the
 * editor) is what applies from Large up and to every range left empty.
 */
export interface ImageResponsive {
  mode: ImageResponsiveMode;
  xs?: number;
  sm?: number;
  md?: number;
}

export interface ImageAttributes {
  src: string;
  alt?: string | null;
  title?: string | null;
  caption?: string | null;
  captionAlign?: ImageAlign;
  displayMode?: ImageDisplayMode;
  align?: ImageAlign;
  width?: ImageWidth;
  height?: ImageWidth;
  responsive?: ImageResponsive | null;
}

export interface ImageInlineAttributes {
  src: string;
  alt?: string | null;
  width?: ImageWidth;
  verticalAlign?: ImageVerticalAlign;
}
