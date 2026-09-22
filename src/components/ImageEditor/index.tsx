// import 'react-advanced-cropper/dist/style.css';
// import './parts/style.scss';

import './parts/style.scss';

import { useRef, useState, useId } from 'react';
import {
  type CropperRef,
  Cropper,
  CircleStencil,
  RectangleStencil,
} from 'react-advanced-cropper';
import { Button, Popover, Select, Slider, ColorPicker, Space } from 'antd';
import { LuFlipVertical, LuZoomIn, LuZoomOut } from "react-icons/lu";
import { useDrawingCanvas } from './useDrawingCanvas';
import { useImageFilters } from './useImageFilters';
import { aspectRatioOptions, presetSelectOptions } from './parts/constants';

export interface ImageEditorProps {
  value?: string | null; // src
  disabled?: boolean;
  enableDrawing?: boolean; // Controls whether drawing functionality is enabled
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  value,
  disabled,
  enableDrawing = true,
}) => {
  const myId = useId();
  const cropperRef = useRef<CropperRef>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [aspectRatio, setAspectRatio] = useState<string | number | null>(null);
  const [isCircle, setIsCircle] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);

  // Dedicated Filters Hook
  const {
    filters,
    activePreset,
    handleFilterChange,
    resetFilters,
    applyPreset,
    getCssFilterString,
  } = useImageFilters();

  // Custom drawing hook integration
  const drawing = useDrawingCanvas({
    enabled: enableDrawing && isDrawingMode,
    containerRef,
  });

  const handleRotate = (angle: number) => 
    cropperRef.current?.rotateImage(angle);
  
  const handleFlip = (horizontal: boolean, vertical: boolean) =>
    cropperRef.current?.flipImage(horizontal, vertical);

  const handleZoomIn = () => cropperRef.current?.zoomImage(1.2);

  const handleZoomOut = () => cropperRef.current?.zoomImage(0.8);

  const handleReset = () => {
    cropperRef.current?.reset();
    resetFilters();
    setAspectRatio(null);
    setIsCircle(false);
    setIsDrawingMode(false);
    if (enableDrawing) drawing.handleClearAll();
  };

  const handleDownload = () => {
    if (!cropperRef.current) return;

    const croppedCanvas = cropperRef.current.getCanvas({
      width: 1920,
      fillColor: isCircle ? undefined : '#ffffff',
    });

    if (!croppedCanvas) return;

    const exportCanvas = document.createElement('canvas');
    const width = croppedCanvas.width;
    const height = croppedCanvas.height;
    exportCanvas.width = width;
    exportCanvas.height = height;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Apply circular clip mask if circle mode is active
    if (isCircle) {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip(); // Mask everything outside the circle
    }

    // 1. Render cropped image with CSS filters applied
    ctx.filter = getCssFilterString();
    ctx.drawImage(croppedCanvas, 0, 0);
    ctx.filter = 'none';

    // 2. Render freehand strokes over exported canvas if drawing is enabled
    if (enableDrawing) {
      drawing.strokes.forEach((stroke) => {
        if (stroke.points.length < 2) return;

        const scaleFactor =
          stroke.stencilWidthAtDraw > 0
            ? width / stroke.stencilWidthAtDraw
            : 1;

        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width * scaleFactor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(
          stroke.points[0].x * width,
          stroke.points[0].y * height
        );

        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(
            stroke.points[i].x * width,
            stroke.points[i].y * height
          );
        }
        ctx.stroke();
      });
    }

    const link = document.createElement('a');
    link.download = `edited-image.${isCircle ? 'png' : 'jpg'}`;
    link.href = exportCanvas.toDataURL(
      'image/' + (isCircle ? 'png' : 'jpeg'),
      0.95
    );
    link.click();
  };

  const handleChangeCropper = () => {
    if (enableDrawing && isDrawingMode) {
      drawing.syncCanvasOverlay();
    }
  };

  if (!value) {
    return null;
  }

  const currentFilter = getCssFilterString();

  return (
    <div
      className="flex flex-nowrap"
      style={{ 
        height: 'calc(100vh - 227px)',
        minHeight: 375, 
      }}
    >
<style>{`
.${myId} .filterCropImg,
.${myId} .customCropRoot img,
.${myId} .customCropRoot canvas,
.${myId} .filterCropBg{
  filter:${currentFilter} !important
}`}</style>

      <div
        ref={containerRef}
        className={myId + " ie relative grow h-full overflow-hidden" + (disabled ? " ie-disabled" : "")}
        // style={{ height: 420 }}
      >
        <Cropper
          ref={cropperRef}
          src={value}
          disabled={disabled}
          className={`cropper customCropRoot w-full h-full${isDrawingMode ? ' drawing-mode-active' : ''}`}
          // @ts-ignore
          imageClassName="filterCropImg"
          backgroundClassName="filterCropBg"
          stencilComponent={isCircle ? CircleStencil : RectangleStencil}
          onChange={handleChangeCropper}
          stencilProps={{
            movable: !isDrawingMode,
            resizable: !isDrawingMode,
            lines: !isDrawingMode,
            handlers: !isDrawingMode,
            aspectRatio: isCircle ? 1 : aspectRatio ?? undefined,
            grid: isDrawingMode ? false : showGrid,
          }}
          defaultSize={({ imageSize, visibleArea }) => ({
            width: (visibleArea || imageSize).width,
            height: (visibleArea || imageSize).height,
          })}
          // style={{ 
          //   width: '100%', 
          //   height: '100%', 
          //   // background: '#333' 
          // }}
        />

        <canvas {...(drawing.canvasProps as any)} />

        {/* Canvas DOM node renders strictly when drawing is active */}
        {/* {enableDrawing && isDrawingMode && <canvas {...drawing.canvasProps} />} */}
      </div>

      <aside 
        className="space-y-2 flex-none p-2 border overflow-auto overscroll-contain q-scroll"
        style={{ width: 235 }}
      >
        <div>
          <label htmlFor="ars">Aspect Ratio</label>
          <Select
            id="ars"
            className="w-full mt-1"
            options={aspectRatioOptions}
            disabled={isCircle}
            value={aspectRatio ?? ''}
            onChange={setAspectRatio}
            // optionRender={(Option) => (
            //   <div className="flex items-center gap-1 text-13">
            //     <Option.data.icon className="flex-none" />{Option.label}
            //   </div>
            // )}
          />
        </div>

        <Button
          block
          type={isCircle ? 'primary' : 'default'}
          onClick={() => setIsCircle(!isCircle)}
        >
          {isCircle ? 'Circle Mode' : 'Square/Rectangle Mode'}
        </Button>

        <Button
          block
          type={showGrid ? 'primary' : 'default'}
          onClick={() => setShowGrid(!showGrid)}
        >
          {showGrid ? 'Grid On' : 'Grid Off'}
        </Button>

        <Space>
          <Space.Compact>
            <Button 
              title="Rotate 90° CCW"
              icon={<b>↺</b>}
              onClick={() => handleRotate(-90)}
            />
            <Button 
              title="Rotate 90° CW"
              icon={<b>↻</b>}
              onClick={() => handleRotate(90)}
            />
          </Space.Compact>

          <Space.Compact>
            <Button 
              title="Flip Horizontal"
              icon={<LuFlipVertical className="rotate-90" />}
              onClick={() => handleFlip(true, false)}
            />
            <Button 
              title="Flip Vertical"
              icon={<LuFlipVertical />}
              onClick={() => handleFlip(false, true)}
            />
          </Space.Compact>

          <Space.Compact>
            <Button 
              title="Zoom In" // 🔍+ 
              icon={<LuZoomIn />}
              onClick={handleZoomIn}
            />
            <Button 
              title="Zoom Out" // 🔍- 
              icon={<LuZoomOut />}
              onClick={handleZoomOut}
            />
          </Space.Compact>
        </Space>

        <div className="pt-2">
          <label>Brightness: {filters.brightness}</label>
          <Slider 
            min={-100}
            // max={100} // antd default 100
            value={filters.brightness}
            onChange={handleFilterChange('brightness')}
          />
        </div>
        <div>
          <label>Contrast: {filters.contrast}</label>
          <Slider 
            min={-100}
            value={filters.contrast}
            onChange={handleFilterChange('contrast')}
          />
        </div>
        <div>
          <label>Saturation: {filters.saturation}</label>
          <Slider 
            min={-100}
            value={filters.saturation}
            onChange={handleFilterChange('saturation')}
          />
        </div>
        <div>
          <label>Hue Rotation: {filters.hue}°</label>
          <Slider 
            min={-180}
            max={180}
            value={filters.hue}
            onChange={handleFilterChange('hue')}
          />
        </div>

        <div>
          <label htmlFor="prt">Preset</label>
          <Select
            id="prt"
            className="w-full mt-1"
            options={presetSelectOptions}
            value={activePreset ?? ''}
            onChange={applyPreset}
          />
        </div>

        {enableDrawing && (
          <>
            <Button
              block
              type={isDrawingMode ? 'primary' : 'default'}
              onClick={() => {
                const nextMode = !isDrawingMode;
                setIsDrawingMode(nextMode);
                if (nextMode) {
                  setTimeout(() => drawing.syncCanvasOverlay(), 20);
                }
              }}
            >
              ✏️ {isDrawingMode ? 'Draw Mode ON' : 'Freehand Draw'}
            </Button>

            {isDrawingMode && (
              <Popover
                title="Brush Options"
                trigger="click"
                content={
                  <div className="space-y-2">
                    <div>
                      <label>Brush Color:</label>
                      <br />
                      <ColorPicker 
                        showText 
                        allowClear 
                        className="mt-1"
                        value={drawing.brushColor}
                        onChange={(_val, css) => {
                          // console.log({ _val, css })
                          drawing.setBrushColor(css)
                        }}
                      />
                    </div>
                    <div>
                      <label>Thickness: {drawing.brushWidth}px</label>
                      <Slider 
                        min={1}
                        max={40}
                        value={drawing.brushWidth}
                        onChange={drawing.setBrushWidth}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="small"
                        onClick={drawing.handleUndo}
                        disabled={!drawing.strokes.length}
                      >
                        Undo (Ctrl + Z)
                      </Button>
                      <Button
                        size="small"
                        onClick={drawing.handleRedo}
                        disabled={!drawing.redoStack.length}
                      >
                        Redo (Ctrl + Y)
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={drawing.handleClearAll}
                        disabled={!drawing.strokes.length}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                }
              >
                <Button block>🎨 Brush & History</Button>
              </Popover>
            )}
          </>
        )}

        <Space.Compact block>
          <Button 
            block
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            block
            type="primary" 
            onClick={handleDownload}
          >
            Save Image
          </Button>
        </Space.Compact>
      </aside>
    </div>
  );
};
