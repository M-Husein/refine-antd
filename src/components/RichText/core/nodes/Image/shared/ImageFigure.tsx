import type { CSSProperties, ReactNode } from "react";
import type {
  ImageAlign,
  ImageDisplayMode,
  ImageVerticalAlign,
} from "../types";

const alignToJustify: Record<ImageAlign, CSSProperties["alignItems"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

export interface ImageFigureProps {
  src: string;
  alt?: string;
  title?: string;
  caption?: string | null;
  captionAlign?: ImageAlign;
  displayMode?: ImageDisplayMode;
  align?: ImageAlign;
  width?: string | null;
  height?: string | null;
  editorOverlay?: ReactNode;
  className?: string;
}

export const ImageFigure = ({
  caption,
  captionAlign = "left",
  displayMode = "block",
  align = "left",
  width,
  height,
  editorOverlay,
  className,
  ...etc
}: ImageFigureProps) => {
  // Jika width diisi, gunakan nilainya. Jika tidak, gunakan fit-content dengan max-width 100%.
  const widthStyle = width ? { width } : { width: "fit-content", maxWidth: "100%" };

  // Perataan horizontal yang konsisten baik selected maupun unselected
  const alignmentMargins: CSSProperties = 
    align === "center"
      ? { marginLeft: "auto", marginRight: "auto" }
      : align === "right"
        ? { marginLeft: "auto", marginRight: 0 }
        : { marginLeft: 0, marginRight: "auto" };

  const figureStyle: CSSProperties =
    displayMode === "float-left"
      ? { float: "left", margin: "0 1rem 1rem 0", ...widthStyle }
      : displayMode === "float-right"
        ? { float: "right", margin: "0 0 1rem 1rem", ...widthStyle }
        : {
            display: "flex",
            flexDirection: "column",
            alignItems: alignToJustify[align],
            ...widthStyle,
            maxWidth: "100%",
            ...alignmentMargins,
          };

  const imgStyle: CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    height: height || "auto",
  };

  return (
    <figure
      className={["rte-image", "rte-image--" + displayMode, className]
        .filter(Boolean)
        .join(" ")}
      style={figureStyle}
      data-align={align}
    >
      <img style={imgStyle} {...etc} className="block" />
      {editorOverlay}
      {caption && (
        <figcaption 
          className="w-full mt-1" 
          style={{ textAlign: captionAlign }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export interface ImageInlineSpanProps {
  src: string;
  alt?: string;
  width?: string | null;
  verticalAlign?: ImageVerticalAlign;
  editorOverlay?: ReactNode;
  className?: string;
}

export const ImageInlineSpan = ({
  src,
  alt,
  width,
  verticalAlign = "baseline",
  editorOverlay,
  className,
}: ImageInlineSpanProps) => {
  const imgStyle: CSSProperties = {
    maxWidth: "100%",
    height: "auto",
    ...(width ? { width } : {}),
    ...(verticalAlign && verticalAlign !== "baseline" ? { verticalAlign } : {}),
  };

  return (
    <span
      className={["rte-image-inline relative inline-block", className].filter(Boolean).join(" ")}
    >
      <img
        src={src}
        alt={alt}
        style={imgStyle}
      />
      {editorOverlay}
    </span>
  );
};
