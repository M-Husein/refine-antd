import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { DOMOutputSpec } from "@tiptap/pm/model";
import type { ImageAlign, ImageDisplayMode, ImageVerticalAlign } from "./types";
// import { styleAttrs } from "@/components/RichText/core/content/style-attr";

const MARK_WRAPPER_TAGS = new Set(["A", "STRONG", "EM", "U", "S", "CODE"]);

const findBlockContainer = (el: HTMLElement): HTMLElement | null => {
  let node: HTMLElement | null = (el as unknown as { parentNode?: HTMLElement }).parentNode ?? null;
  while (node && MARK_WRAPPER_TAGS.has(node.tagName)) {
    node = (node as unknown as { parentNode?: HTMLElement }).parentNode ?? null;
  }
  return node;
};

const containsNode = (root: HTMLElement, target: HTMLElement): boolean => {
  if (root === target) return true;
  const children = (root as unknown as { childNodes?: HTMLElement[] }).childNodes;
  if (!children) return false;
  for (const child of Array.from(children)) {
    if (containsNode(child as HTMLElement, target)) return true;
  }
  return false;
};

const isSoleBlockContent = (el: HTMLElement): boolean => {
  const container = findBlockContainer(el);
  if (!container) return true;
  if (container.tagName !== "P") return true;
  const meaningful = Array.from(
    (container as unknown as { childNodes: (HTMLElement | { nodeType: number; textContent?: string })[] }).childNodes,
  ).filter((n) => {
    if ((n as { nodeType: number }).nodeType === 3) {
      return Boolean((n as { textContent?: string }).textContent?.trim());
    }
    return true;
  });
  if (meaningful.length !== 1) return false;
  const only = meaningful[0] as HTMLElement;
  return only === el || containsNode(only, el);
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    image: {
      setImage: (attrs: {
        src: string;
        alt?: string;
        title?: string;
        caption?: string;
        displayMode?: ImageDisplayMode;
        align?: ImageAlign;
        width?: string | null;
        height?: string | null;
      }) => ReturnType;
      updateImage: (attrs: Record<string, unknown>) => ReturnType;
    };
    imageInline: {
      setImageInline: (attrs: {
        src: string;
        alt?: string;
        width?: string | null;
        verticalAlign?: ImageVerticalAlign;
      }) => ReturnType;
    };
  }
}

export const Image = Node.create({
  name: "image",
  group: "block",
  draggable: true,
  isolating: true,
  marks: "link",
  addAttributes() {
    const noRender = { 
      renderHTML: () => ({}), 
      parseHTML: () => null 
    };
    return {
      src: { default: null, ...noRender },
      alt: { default: null, ...noRender },
      title: { default: null, ...noRender },
      caption: {
        default: null,
        parseHTML: (element) => element.querySelector("figcaption")?.textContent || null,
        renderHTML: (attributes) => {
          if (!attributes.caption) return {};
          return {};
        },
      },
      captionAlign: {
        default: "left",
        parseHTML: (element) => element.querySelector("figcaption")?.style.textAlign || "left",
        renderHTML: (attributes) => {
          if (!attributes.captionAlign) return {};
          return { "data-caption-align": attributes.captionAlign };
        },
      },
      displayMode: { default: "block", ...noRender },
      align: { default: "left", ...noRender },
      width: { default: null, ...noRender },
      height: { default: null, ...noRender },
      responsive: { default: null, ...noRender },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-rte-image]",
        getAttrs: (figure: HTMLElement) => {
          const img = figure.querySelector("img");
          const figcaption = figure.querySelector("figcaption");
          if (!img) return false;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            width: img.style.width || img.getAttribute("width") || null,
            height: img.style.height || img.getAttribute("height") || null,
            align: figure.getAttribute("data-align") ?? "left",
            displayMode: figure.getAttribute("data-display-mode") ?? "block",
            caption: figcaption ? figcaption.textContent : null,
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (node: HTMLElement) => {
          if (node.hasAttribute("data-rte-inline")) return false;
          if (!isSoleBlockContent(node)) return false;
          return {
            src: node.getAttribute("src"),
            alt: node.getAttribute("alt"),
            title: node.getAttribute("title"),
            width: node.style.width || node.getAttribute("width") || null,
            height: node.style.height || node.getAttribute("height") || null,
            align: node.getAttribute("data-align") ?? "center",
            displayMode: node.getAttribute("data-display-mode") ?? "block",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { src, alt, title, caption, captionAlign, align, displayMode, width, height } = node.attrs;
    
    // 1. Style for the figure container (controls width and alignment)
    const widthStyle = width ? `width: ${width};` : "width: fit-content; max-width: 100%;";
    const alignmentMargins = 
      align === "center"
        ? "margin-left: auto; margin-right: auto;"
        : align === "right"
          ? "margin-left: auto; margin-right: 0;"
          : "margin-left: 0; margin-right: auto;";

    const figureStyle = [widthStyle, alignmentMargins].filter(Boolean).join(" ");

    // 2. Style for the img tag inside the figure
    const imgStyle = [
      "width: 100%;",
      "max-width: 100%;",
      "height: auto;",
      height ? `height: ${height};` : "",
    ].filter(Boolean).join(" ");

    const img: DOMOutputSpec = [
      "img",
      mergeAttributes({
        src,
        alt,
        title,
        style: imgStyle,
      }),
    ];

    // Optional caption, rendered after the image
    const figcaption: DOMOutputSpec[] = caption
      ? [["figcaption", { style: `text-align: ${captionAlign || "left"};` }, caption]]
      : [];

    // 3. Return the HTML structure: figure > [img, figcaption?]
    //    (editor-only overlays such as resize handles belong to the NodeView, not to this output)
    return [
      "figure",
      mergeAttributes(HTMLAttributes, {
        "data-rte-image": "",
        "data-align": align,
        "data-display-mode": displayMode,
        "data-caption-align": captionAlign || "left",
        style: figureStyle,
      }),
      img,
      ...figcaption,
    ];
  },

  addCommands() {
    return {
      setImage:
        (attrs) =>
        ({ commands }: CommandProps) =>
          commands.insertContent({ type: this.name, attrs }),
      updateImage:
        (attrs) =>
        ({ commands }: CommandProps) =>
          commands.updateAttributes(this.name, attrs),
    };
  },
});

export const ImageInline = Node.create({
  name: "imageInline",
  group: "inline",
  inline: true,
  draggable: true,
  marks: "link",

  addAttributes() {
    const noRender = { 
      renderHTML: () => ({}), 
      parseHTML: () => null 
    };
    return {
      src: { default: null, ...noRender },
      alt: { default: null, ...noRender },
      width: { default: null, ...noRender },
      verticalAlign: { default: "baseline", ...noRender },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (node: HTMLElement) => {
          const explicit = node.hasAttribute("data-rte-inline");
          if (!explicit && isSoleBlockContent(node)) return false;
          return {
            src: node.getAttribute("src"),
            alt: node.getAttribute("alt"),
            width: node.style.width || node.getAttribute("width") || null,
            verticalAlign: node.style.verticalAlign || "baseline",
          };
        },
      },
    ];
  },

  renderHTML({ node }): DOMOutputSpec {
    const { src, alt, width, verticalAlign } = node.attrs;
    const imgStyle = [
      "max-width: 100%;",
      "height: auto;",
      width ? `width: ${width};` : "",
      verticalAlign && verticalAlign !== "baseline" ? `vertical-align: ${verticalAlign};` : "",
    ].filter(Boolean).join(" ");

    return [
      "img",
      mergeAttributes({
        src,
        alt,
        "data-rte-inline": "",
        style: imgStyle,
      }),
    ];
  },

  addCommands() {
    return {
      setImageInline:
        (attrs) =>
        ({ commands }: CommandProps) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export const createImageExtensions = () => [Image, ImageInline];
