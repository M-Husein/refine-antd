import { useState, useRef, useCallback, useEffect } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Button } from "antd";
import { ImageFigure } from "../shared/ImageFigure";
import { ImageEditDrawer, type ImageEditValues } from "./ImageEditDrawer";
import { normalizeResponsive } from "../responsive";
import { normalizeWidth } from "../size";

// Only one edit drawer at a time: opening another image's drawer closes (and discards) the previous one.
// `owner` identifies the node view that opened it.
let activeDrawer: { owner: object; close: () => void } | null = null;

export const ImageNodeView = ({ node, updateAttributes, selected }: ReactNodeViewProps) => {
  const { src, alt, title, caption, captionAlign, displayMode, align, width, height } = node.attrs;
  const [open, setOpen] = useState(false);
  // A new key for every opening gives the drawer a fresh draft (see ImageEditDrawer).
  const [session, setSession] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const responsive = normalizeResponsive(node.attrs.responsive);

  const [owner] = useState(() => ({}));

  const closeDrawer = useCallback(() => {
    setOpen(false);
    if (activeDrawer?.owner === owner) activeDrawer = null;
  }, [owner]);

  // The node view can go away while its drawer is open (the image is deleted, undo, ...).
  useEffect(
    () => () => {
      if (activeDrawer?.owner === owner) activeDrawer = null;
    },
    [owner],
  );

  const openDrawer = () => {
    if (open) return;
    activeDrawer?.close();
    activeDrawer = { owner, close: closeDrawer };
    setSession((s) => s + 1);
    setOpen(true);
  };

  // What the form starts from. The drawer takes this once, when it opens.
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
        onClick={openDrawer}
      >
        Edit image
      </Button>

      {/* Resize Handles. Hidden while the drawer is open: the drawer holds the edits until Save. */}
      {!open && (
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
      )}
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

      {/* Outside `selected`: the drawer stays open when the image loses its selection (e.g. you click the text). */}
      <ImageEditDrawer
        key={session}
        open={open}
        values={editValues}
        onClose={closeDrawer}
        onSave={(patch) => {
          updateAttributes(patch);
          closeDrawer();
        }}
      />
    </NodeViewWrapper>
  );
};
