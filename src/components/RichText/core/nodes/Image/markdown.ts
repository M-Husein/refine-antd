import type { JSONContent } from "@tiptap/core";
import type { MarkdownRepresentation } from "@/components/RichText/core/types";

export interface ImageMarkdownInfo {
  isSimple: boolean;
  nativeSyntax: string;
  htmlImgTag: string;
}

const escapeAlt = (s: string) => s.replace(/[[\]]/g, "\\$&");

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
  } = attrs ?? {};

  const isSimple =
    !caption &&
    !width &&
    !height &&
    (!displayMode || displayMode === "block") &&
    (!align || align === "center") &&
    (!verticalAlign || verticalAlign === "baseline");

  const nativeSyntax = title
    ? `![${escapeAlt(alt ?? "")}](${src ?? ""} "${title}")`
    : `![${escapeAlt(alt ?? "")}](${src ?? ""})`;

  const styles = [
    "max-width: 100%",
    "height: auto",
    width ? `width: ${width}` : "",
    height ? `height: ${height}` : "",
    verticalAlign && verticalAlign !== "baseline" ? `vertical-align: ${verticalAlign}` : "",
  ].filter(Boolean).join("; ");

  const imgAttrPairs = [
    `src="${src ?? ""}"`,
    `alt="${alt ?? ""}"`,
    title ? `title="${title}"` : "",
    styles ? `style="${styles}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return { isSimple, nativeSyntax, htmlImgTag: `<img ${imgAttrPairs} />` };
};

export const serializeImage = (node: JSONContent): MarkdownRepresentation => {
  const { caption, align, displayMode } = node.attrs ?? {};
  const info = describeImageForMarkdown(node.attrs);

  if (info.isSimple) {
    return { type: "native", value: info.nativeSyntax };
  }

  const figure = caption
    ? `<figure data-rte-image data-align="${align ?? "center"}" data-display-mode="${displayMode ?? "block"}">${info.htmlImgTag}<figcaption>${caption}</figcaption></figure>`
    : info.htmlImgTag.replace(
        " />",
        ` data-align="${align ?? "center"}" data-display-mode="${displayMode ?? "block"}" />`,
      );

  return { type: "html", value: figure };
};

export const serializeImageInline = (node: JSONContent): MarkdownRepresentation => {
  const info = describeImageForMarkdown(node.attrs);
  return info.isSimple
    ? { type: "native", value: info.nativeSyntax }
    : { type: "html", value: info.htmlImgTag };
};
