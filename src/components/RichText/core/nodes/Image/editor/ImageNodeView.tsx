import { useState, useRef, useCallback } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Space, Button, Input, InputNumber, Popover, Typography } from "antd";
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from "@ant-design/icons";
import { ImageFigure } from "../shared/ImageFigure";
import type { ImageAlign, ImageDisplayMode } from "../types";

const { Text } = Typography;
const sizePresets = ["25%", "50%", "75%", "100%"];
const displayModeOptions: ImageDisplayMode[] = ["block", "float-left", "float-right"];

export const ImageNodeView = ({ node, updateAttributes, selected }: ReactNodeViewProps) => {
  const { src, alt, title, caption, captionAlign, displayMode, align, width, height } = node.attrs;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const changeAlign = (align: ImageAlign) => {
    updateAttributes({ align });
    setOpen(false);
    setTimeout(() => setOpen(true), 0);
  }

  const overlay = selected ? (
    <>
      <Popover
        trigger="click"
        arrow={false}
        placement="bottomRight"
        // getPopupContainer={(trigger: HTMLElement) => trigger?.parentElement || document.body}
        // styles={{
        //   // container: { transition: 'none' },
        //   root: { transition: 'none' },
        // }}
        open={open}
        onOpenChange={setOpen}
        content={
          <Space orientation="vertical" style={{ width: 260 }}>
            {/* Image Alignment */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Image Align</Text>
              <div style={{ marginTop: 2 }}>
                <Space.Compact>
                  <Button
                    size="small"
                    type={(align ?? "left") === "left" ? "primary" : "default"}
                    icon={<AlignLeftOutlined />}
                    // onClick={() => updateAttributes({ align: "left" as ImageAlign })}
                    onClick={() => changeAlign("left")}
                  />
                  <Button
                    size="small"
                    type={align === "center" ? "primary" : "default"}
                    icon={<AlignCenterOutlined />}
                    // onClick={() => updateAttributes({ align: "center" as ImageAlign })}
                    onClick={() => changeAlign("center")}
                  />
                  <Button
                    size="small"
                    type={align === "right" ? "primary" : "default"}
                    icon={<AlignRightOutlined />}
                    // onClick={() => updateAttributes({ align: "right" as ImageAlign })}
                    onClick={() => changeAlign("right")}
                  />
                </Space.Compact>
              </div>
            </div>

            {/* Display Mode */}
            <Space.Compact>
              {displayModeOptions.map((mode) => (
                <Button
                  key={mode}
                  size="small"
                  type={(displayMode ?? "block") === mode ? "primary" : "default"}
                  onClick={() => updateAttributes({ displayMode: mode })}
                >
                  {mode}
                </Button>
              ))}
            </Space.Compact>

            {/* Size Preset (%) */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Size Preset (%)</Text>
              <Space size={4} style={{ display: "flex", marginTop: 4 }}>
                {sizePresets.map((p) => (
                  <Button
                    key={p}
                    size="small"
                    type={width === p ? "primary" : "default"}
                    onClick={() => updateAttributes({ width: p })}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  size="small"
                  danger={!width}
                  onClick={() => updateAttributes({ width: null })}
                >
                  Reset
                </Button>
              </Space>
            </div>

            {/* Custom Width */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Custom Width (%)</Text>
              <InputNumber<number>
                min={1}
                max={100}
                precision={0}
                // placeholder={typeof width === "string" && width && !width.endsWith("%") ? width : "e.g. 50%"}
                // Only a percentage can be shown here; a px width (e.g. "480px") leaves it empty.
                // parseFloat, not unary "+": +"50%" is NaN.
                value={typeof width === "string" && width.endsWith("%") ? Number.parseFloat(width) : null}
                // Same pattern as the antd "Formatter" demo; an empty value must stay empty (not "%").
                formatter={(val) => (val == null || val + '' === "" ? "" : val + '%')}
                parser={(val) => val?.replace(/[^\d.]/g, "") as unknown as number}
                onChange={(val) => updateAttributes({ width: val == null ? null : val + '%' })}
                className="w-full mt-1"
              />
            </div>

            {/* Caption & Caption Align */}
            <Input
              placeholder="Alt text"
              value={alt ?? ""}
              onChange={(e) => updateAttributes({ alt: e.target.value })}
            />
            <Input
              placeholder="Caption text"
              value={caption ?? ""}
              onChange={(e) => updateAttributes({ caption: e.target.value })}
            />

            {caption && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Caption Align</Text>
                <div style={{ marginTop: 2 }}>
                  <Space.Compact>
                    <Button
                      size="small"
                      type={(captionAlign ?? "center") === "left" ? "primary" : "default"}
                      icon={<AlignLeftOutlined />}
                      onClick={() => updateAttributes({ captionAlign: "left" as ImageAlign })}
                    />
                    <Button
                      size="small"
                      type={(captionAlign ?? "center") === "center" ? "primary" : "default"}
                      icon={<AlignCenterOutlined />}
                      onClick={() => updateAttributes({ captionAlign: "center" as ImageAlign })}
                    />
                    <Button
                      size="small"
                      type={(captionAlign ?? "center") === "right" ? "primary" : "default"}
                      icon={<AlignRightOutlined />}
                      onClick={() => updateAttributes({ captionAlign: "right" as ImageAlign })}
                    />
                  </Space.Compact>
                </div>
              </div>
            )}
          </Space>
        }
      >
        <Button 
          size="small" 
          className="absolute top-1 right-1 shadow z-2"
        >
          Edit image
        </Button>
      </Popover>

      {/* Resize Handles */}
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
        className={selected ? "relative inline-block rte-image-selected ring-2 ring-blue-400" : undefined}
        editorOverlay={overlay}
      />
    </NodeViewWrapper>
  );
};
