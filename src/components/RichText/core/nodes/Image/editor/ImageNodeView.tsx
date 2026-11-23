import { useState, useRef, useCallback } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Button } from "antd";
import { ImageFigure } from "../shared/ImageFigure";
import { ImageEditModal, type ImageEditValues } from "./ImageEditModal";
import { normalizeResponsive } from "../responsive";
import { normalizeWidth } from "../size";

export const ImageNodeView = ({ node, updateAttributes, selected }: ReactNodeViewProps) => {
  const { src, alt, title, caption, captionAlign, displayMode, align, width, height } = node.attrs;
  const [open, setOpen] = useState(false);
  // A new key for every opening gives the modal a fresh draft (see ImageEditModal).
  const [session, setSession] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const responsive = normalizeResponsive(node.attrs.responsive);

  const closeModal = useCallback(() => setOpen(false), []);

  const openModal = () => {
    if (open) return;
    setSession((s) => s + 1);
    setOpen(true);
  };

  // What the form starts from. The modal takes this once, when it opens.
  const editValues: ImageEditValues = {
    align: align ?? "left",
    displayMode: displayMode ?? "block",
    width: normalizeWidth(width),
    responsive,
    alt: alt ?? "",
    caption: caption ?? "",
    captionAlign: captionAlign ?? "left",
  };

  // Dragging resize handles logic (Left & Right)
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: "left" | "right") => {
      e.preventDefault();
      e.stopPropagation();

      const figureEl = containerRef.current?.querySelector("figure");
      if (!figureEl) return;
      const startX = e.clientX;
      const startWidth = figureEl.getBoundingClientRect().width;
      const parentWidth =
        containerRef.current?.parentElement?.getBoundingClientRect().width || window.innerWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const newWidthPx = direction === "right" ? startWidth + deltaX : startWidth - deltaX;
        const newPercent = Math.min(Math.max(Math.round((newWidthPx / parentWidth) * 100), 15), 100);
        updateAttributes({ width: newPercent + '%' });
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes]
  );

  const overlay = selected ? (
    <>
      <Button
        size="small"
        className="absolute top-1 right-1 shadow z-2"
        onClick={openModal}
      >
        Edit image
      </Button>

      {/* Resize Handles */}
      <>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-8 bg-blue-500 rounded-r cursor-ew-resize z-1 flex items-center justify-center shadow"
            onMouseDown={(e) => handleResizeStart(e, "left")}
            title="Drag to resize"
          >
            <div className="w-0.5 h-4 bg-white rounded" />
          </div>
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-8 bg-blue-500 rounded-l cursor-ew-resize z-1 flex items-center justify-center shadow"
            onMouseDown={(e) => handleResizeStart(e, "right")}
            title="Drag to resize"
          >
            <div className="w-0.5 h-4 bg-white rounded" />
          </div>
      </>
    </>
  ) : null;

  return (
    <NodeViewWrapper
      as="div"
      ref={containerRef}
      className="w-full"
    >
      <ImageFigure
        src={src}
        alt={alt}
        title={title}
        caption={caption}
        captionAlign={captionAlign}
        displayMode={displayMode}
        align={align}
        width={width}
        height={height}
        responsive={responsive}
        className={selected ? "relative inline-block rte-image-selected ring-2 ring-blue-400" : undefined}
        editorOverlay={overlay}
      />

      {/* Outside `selected`: the modal stays open when the image loses its selection. */}
      <ImageEditModal
        key={session}
        open={open}
        image={{ src, title, height }}
        values={editValues}
        onClose={closeModal}
        onSave={(patch) => {
          updateAttributes(patch);
          closeModal();
        }}
      />
    </NodeViewWrapper>
  );
};
