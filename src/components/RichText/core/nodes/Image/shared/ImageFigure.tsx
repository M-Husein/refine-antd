import type { CSSProperties, ReactNode } from "react";
import type {
  ImageAlign,
  ImageDisplayMode,
  ImageResponsive,
  ImageVerticalAlign,
} from "../types";
import { normalizeResponsive, responsiveDataAttrs, responsiveStyleVars } from "../responsive";
import { normalizeWidth } from "../size";

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
  /** Per-range widths (see ../responsive.ts). Applied by the CSS in styles/content.css. */
  responsive?: ImageResponsive | null;
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
  responsive,
  ...etc
}: ImageFigureProps) => {
  // If a width is provided, use that value. Otherwise, use fit-content with a max-width of 100%.
  // `width` may be a legacy number (480) at runtime; normalizeWidth turns it into a safe CSS value.
  const baseWidth = normalizeWidth(width);
  const widthStyle = baseWidth ? { width: baseWidth } : { width: 'fit-content', maxWidth: '100%' };

  // Consistent horizontal alignment for both selected and unselected states
  const alignmentMargins: CSSProperties = 
    align === "center"
      ? { marginLeft: 'auto', marginRight: 'auto' }
      : align === "right"
        ? { marginLeft: 'auto', marginRight: 0 }
        : { marginLeft: 0, marginRight: 'auto' };

  const figureStyle: CSSProperties =
    displayMode === "float-left"
      ? { float: 'left', margin: '0 1rem 1rem 0', ...widthStyle }
      : displayMode === "float-right"
        ? { float: 'right', margin: '0 0 1rem 1rem', ...widthStyle }
        : {
            display: 'flex',
            flexDirection: 'column',
            alignItems: alignToJustify[align],
            ...widthStyle,
            maxWidth: '100%',
            ...alignmentMargins
          };

  // Responsive width: the CSS rules (styles/content.css) pick the range that matches and override
  // the inline width with !important. The inline width stays as the fallback (no CSS loaded, or no
  // value for the current range).
  const rw = normalizeResponsive(responsive);
  const responsiveStyle = responsiveStyleVars(rw, baseWidth || "fit-content") as CSSProperties;

  // const imgStyle: CSSProperties = {
  //   // width: '100%',
  //   // maxWidth: '100%',
  //   height: height || 'auto',
  // };

  return (
    <figure
      className={["rte-image", `rte-image--${displayMode}`, className].filter(Boolean).join(" ")}
      style={{ ...figureStyle, ...responsiveStyle }}
      data-align={align}
      {...responsiveDataAttrs(rw)}
    >
      <img 
        // style={imgStyle} 
        style={height ? { height } : void 0}
        {...etc} 
        className="block w-full max-w-full h-auto" 
      />
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
  // const imgStyle: CSSProperties = {
  //   // maxWidth: '100%',
  //   // height: 'auto',
  //   ...(width ? { width } : {}),
  //   ...(verticalAlign && verticalAlign !== "baseline" ? { verticalAlign } : {}),
  // };

  return (
    <span className={"rte-image-inline relative inline-block " + (className || "")}>
      <img
        src={src}
        alt={alt}
        style={{
          // maxWidth: '100%',
          // height: 'auto',
          ...(normalizeWidth(width) ? { width: normalizeWidth(width) as string } : {}),
          ...(verticalAlign && verticalAlign !== "baseline" ? { verticalAlign } : {}),
        }}
        className="max-w-full h-auto"
      />
      {editorOverlay}
    </span>
  );
};
