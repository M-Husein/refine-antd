import type { CSSProperties, ReactNode } from "react";
import type {
  ImageAlign,
  ImageDisplayMode,
  ImageVerticalAlign,
} from "../types";

// Used as `alignItems` (not `justifyContent`): the figure is a
// `flex-direction: column` container, where the main axis is vertical —
// `justifyContent` would align along it (top/center/bottom) and never
// move the image horizontally. `alignItems` is the cross axis, i.e.
// left/center/right, which is what `align` actually means here.
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
  displayMode?: ImageDisplayMode;
  align?: ImageAlign;
  width?: number;
  height?: number;
  /** Extra content overlaid on/after the image — editor selection ring,
   * resize handles, upload progress, etc. Viewer never passes this. */
  editorOverlay?: ReactNode;
  className?: string;
}

/**
 * Pure presentation. Contains no editing state, no NodeView machinery, no
 * ProseMirror knowledge — safe to render from Viewer as well as
 * from the Editor's NodeView (spec 8.1: "Editor and Viewer must render
 * content visually the same").
 */
export const ImageFigure = ({
  // src,
  // alt,
  // title,
  // width,
  // height,
  caption,
  displayMode = "block",
  align = "left",
  editorOverlay,
  className,
  ...etc
}: ImageFigureProps) => {
  const floatStyle: CSSProperties =
    displayMode === "float-left"
      ? { float: "left", margin: "0 1rem 1rem 0" }
      : displayMode === "float-right"
        ? { float: "right", margin: "0 0 1rem 1rem" }
        : { display: "flex", flexDirection: "column", alignItems: alignToJustify[align] };

  return (
    <figure
      className={["rte-image", "rte-image--" + displayMode, className]
        .filter(Boolean)
        .join(" ")}
      style={floatStyle}
      data-align={align}
    >
      <div className="relative inline-block">
        <img
          // src={src}
          // alt={alt}
          // title={title}
          // width={width}
          // height={height}
          {...etc}
          className="block max-w-full"
        />
        {editorOverlay}
      </div>
      {!caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

export interface ImageInlineSpanProps {
  src: string;
  alt?: string;
  width?: number;
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
}: ImageInlineSpanProps) => (
  <span
    className={["rte-image-inline relative inline-block", className].filter(Boolean).join(" ")}
    // style={{ position: "relative", display: "inline-block" }}
  >
    <img
      src={src}
      alt={alt}
      width={width}
      className="max-w-full"
      style={{ verticalAlign }} // , maxWidth: "100%"
    />
    {editorOverlay}
  </span>
);
