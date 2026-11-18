export type ImageDisplayMode = "block" | "float-left" | "float-right";
export type ImageAlign = "left" | "center" | "right";
export type ImageVerticalAlign = "baseline" | "top" | "middle" | "bottom";

export type ImageWidth = string | number | null;
export type ImageResponsive = boolean | null;

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
  responsive?: ImageResponsive;
}

export interface ImageInlineAttributes {
  src: string;
  alt?: string | null;
  width?: ImageWidth;
  verticalAlign?: ImageVerticalAlign;
}
