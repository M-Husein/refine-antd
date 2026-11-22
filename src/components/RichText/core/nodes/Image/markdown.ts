import type { JSONContent } from "@tiptap/core";
import type { MarkdownRepresentation } from "@/components/RichText/core/types";
import { normalizeResponsive, responsiveDataAttrs } from "./responsive";
import { normalizeWidth } from "./size";

/** Escapes text for an HTML attribute value or text node (the HTML fallback writes both). */
const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ALIGNS = new Set(["left", "center", "right"]);
const DISPLAY_MODES = new Set(["block", "float-left", "float-right"]);

/** `![alt]`: brackets and backslashes would end or escape the alt text early. */
const escapeAlt = (s: string) => s.replace(/[\\[\]]/g, "\\$&");

/** The URL part of `![alt](url "title")`: wrapped in <> when it holds characters that would end it. */
const markdownDestination = (src: string) =>
  /[\s()<>\\]/.test(src)
    ? `<${src.replace(/\\/g, "\\\\").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\r?\n/g, "%0A")}>`
    : src;

const markdownTitle = (title: string) => `"${title.replace(/[\\"]/g, "\\$&")}"`;

export interface ImageMarkdownInfo {
  isSimple: boolean;
  nativeSyntax: string;
  htmlImgTag: string;
}

export const describeImageForMarkdown = (attrs: JSONContent["attrs"]): ImageMarkdownInfo => {
  const {
    src,
    alt,
    title,
    caption,
    align,
    displayMode,
    width,
    height,
    verticalAlign,
    responsive,
  } = attrs ?? {};

  // Numbers only (validated), so they are safe to write into an attribute value.
  const rw = normalizeResponsive(responsive);
  // A legacy number (480) becomes "480px"; anything that is not a plain CSS length is dropped.
  const safeWidth = normalizeWidth(width);

  // The same rule for every value that ends up inside a style: only a plain CSS length / keyword.
  const safeHeight = normalizeWidth(height);
  const safeVerticalAlign =
    typeof verticalAlign === "string" && /^[a-z-]+$/.test(verticalAlign) ? verticalAlign : "";

  const isSimple =
    !caption &&
    !rw &&
    !safeWidth &&
    !safeHeight &&
    (!displayMode || displayMode === "block") &&
    (!align || align === "center") &&
    (!safeVerticalAlign || safeVerticalAlign === "baseline");

  const nativeSyntax = title
    ? `![${escapeAlt(alt ?? "")}](${markdownDestination(src ?? "")} ${markdownTitle(String(title))})`
    : `![${escapeAlt(alt ?? "")}](${markdownDestination(src ?? "")})`;

  // Compact on purpose: "max-width:100%;height:auto", no spaces after ":" or ";".
  const styles = [
    "max-width:100%",
    "height:auto",
    safeWidth ? `width:${safeWidth}` : "",
    safeHeight ? `height:${safeHeight}` : "",
    safeVerticalAlign && safeVerticalAlign !== "baseline" ? `vertical-align:${safeVerticalAlign}` : "",
  ].filter(Boolean).join(";");

  // Every value written into an attribute is escaped, so alt/title/src can neither cut the
  // attribute short nor add attributes (onerror=...) to the tag.
  const imgAttrPairs = [
    `src="${escapeHtml(src)}"`,
    `alt="${escapeHtml(alt)}"`,
    title ? `title="${escapeHtml(title)}"` : "",
    styles ? `style="${styles}"` : "",
    ...Object.entries(responsiveDataAttrs(rw)).map(([name, value]) => `${name}="${value}"`),
  ]
    .filter(Boolean)
    .join(" ");

  return { isSimple, nativeSyntax, htmlImgTag: `<img ${imgAttrPairs} />` };
};

export const serializeImage = (node: JSONContent): MarkdownRepresentation => {
  const { caption, align, displayMode, captionAlign } = node.attrs ?? {};
  const info = describeImageForMarkdown(node.attrs);
  // The parser reads the caption alignment from the figcaption's text-align; "left" is the default.
  const captionStyle =
    captionAlign === "center" || captionAlign === "right" ? ` style="text-align:${captionAlign}"` : "";
  const safeAlign = ALIGNS.has(align) ? align : "center";
  const safeMode = DISPLAY_MODES.has(displayMode) ? displayMode : "block";

  if (info.isSimple) {
    return { type: "native", value: info.nativeSyntax };
  }

  const figure = caption
    ? `<figure data-rte-image data-align="${safeAlign}" data-display-mode="${safeMode}">${info.htmlImgTag}<figcaption${captionStyle}>${escapeHtml(caption)}</figcaption></figure>`
    : info.htmlImgTag.replace(
        " />",
        ` data-align="${safeAlign}" data-display-mode="${safeMode}" />`,
      );

  return { type: "html", value: figure };
};

export const serializeImageInline = (node: JSONContent): MarkdownRepresentation => {
  const info = describeImageForMarkdown(node.attrs);
  return info.isSimple
    ? { type: "native", value: info.nativeSyntax }
    : { type: "html", value: info.htmlImgTag };
};
