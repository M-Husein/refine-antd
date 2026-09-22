import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type MouseEvent,
  type TouchEvent,
} from 'react';
import { useHistory } from './useHistory';

const createStrokePath = (
  points: Point[],
  width: number,
  height: number
): Path2D | undefined => {
  if (points.length < 2) return;

  const path = new Path2D();
  // Scale normalized 0-1 points to physical canvas pixels upfront
  path.moveTo(points[0].x * width, points[0].y * height);

  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i].x * width, points[i].y * height);
  }

  return path;
};

export interface Point {
  x: number; // Normalized 0-1 relative to canvas width
  y: number; // Normalized 0-1 relative to canvas height
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
  stencilWidthAtDraw: number;
  path?: Path2D; // Pre-compiled path cached on completion
}

export interface UseDrawingCanvasOptions {
  enabled: boolean;
  containerRef: React.RefObject<HTMLElement | undefined | null>;
  stencilSelector?: string;
}

export const useDrawingCanvas = ({
  enabled,
  containerRef,
  stencilSelector = '.cropper-stencil,.advanced-cropper-stencil,[class*="stencil"]',
}: UseDrawingCanvasOptions) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushWidth, setBrushWidth] = useState(2);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const {
    history: strokes,
    redoStack,
    push: pushStroke,
    undo: handleUndo,
    redo: handleRedo,
    clear: handleClearAll,
  } = useHistory<Stroke>();

  // Helper to query stencil's current bounding client rect
  const getStencilBoundingRect = useCallback(
    (): DOMRect | undefined =>
      containerRef.current
        ?.querySelector(stencilSelector)
        ?.getBoundingClientRect(),
    [containerRef, stencilSelector]
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawStroke = (stroke: Stroke) => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;

      if (stroke.path) {
        // Fast Path2D render with correct, unscaled line thickness
        ctx.stroke(stroke.path);
      } else {
        // Active drawing fallback
        if (stroke.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x * width, stroke.points[0].y * height);

        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x * width, stroke.points[i].y * height);
        }

        ctx.stroke();
      }
    };

    strokes.forEach(drawStroke);
    if (currentStroke) drawStroke(currentStroke);
  }, [strokes, currentStroke]);

  useEffect(() => {
    if (enabled) redrawCanvas();
  }, [enabled, redrawCanvas]);

  const syncCanvasOverlay = useCallback(() => {
    if (!enabled) return;

    // Wait for browser layout to settle on initial enable/mount
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const stencilRect = getStencilBoundingRect();

      if (canvas && container && stencilRect && stencilRect.width > 0) {
        const containerRect = container.getBoundingClientRect();

        canvas.style.left = `${stencilRect.left - containerRect.left}px`;
        canvas.style.top = `${stencilRect.top - containerRect.top}px`;
        canvas.style.width = `${stencilRect.width}px`;
        canvas.style.height = `${stencilRect.height}px`;

        if (
          canvas.width !== stencilRect.width ||
          canvas.height !== stencilRect.height
        ) {
          canvas.width = stencilRect.width;
          canvas.height = stencilRect.height;

          strokes.forEach((stroke) => {
            stroke.path = createStrokePath(
              stroke.points,
              canvas.width,
              canvas.height
            );
          });
        }

        redrawCanvas();
      }
    });
  }, [enabled, containerRef, getStencilBoundingRect, redrawCanvas, strokes]);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Immediately sync overlay on enable
    syncCanvasOverlay();

    // Watch container/stencil for size or position shifts
    const observer = new ResizeObserver(() => syncCanvasOverlay());
    observer.observe(container);

    // window.addEventListener('resize', syncCanvasOverlay);

    return () => {
      observer.disconnect();
      // window.removeEventListener('resize', syncCanvasOverlay);
    };
  }, [enabled, syncCanvasOverlay]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (evt: KeyboardEvent) => {
      const target = evt.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isCmdOrCtrl = evt.metaKey || evt.ctrlKey;
      if (isCmdOrCtrl) {
        const key = evt.key.toLowerCase();
        if (key === 'z' && !evt.shiftKey) {
          evt.preventDefault();
          handleUndo();
        } else if (key === 'y' || (key === 'z' && evt.shiftKey)) {
          evt.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleUndo, handleRedo]);

  const getNormalizedPoint = (
    evt: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ): Point | undefined => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in evt ? evt.touches[0].clientX : evt.clientX;
    const clientY = 'touches' in evt ? evt.touches[0].clientY : evt.clientY;

    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  };

  const handleStartDraw = (
    evt: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) => {
    if (!enabled) return;

    evt.preventDefault();
    evt.stopPropagation();

    const canvas = canvasRef.current;
    const point = canvas && getNormalizedPoint(evt);

    if (point) {
      setIsDrawing(true);
      setCurrentStroke({
        points: [point],
        color: brushColor,
        width: brushWidth,
        stencilWidthAtDraw: canvas.width,
      });
    }
  };

  const handleMoveDraw = (
    evt: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !enabled || !currentStroke) return;
    
    evt.preventDefault();
    evt.stopPropagation();

    const point = getNormalizedPoint(evt);
    if (point) {
      setCurrentStroke({
        ...currentStroke,
        points: [...currentStroke.points, point],
      });
    }
  };

  const handleEndDraw = (
    evt?: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) => {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }

    if (!isDrawing) return;

    setIsDrawing(false);
    const canvas = canvasRef.current;

    if (currentStroke && currentStroke.points.length > 1 && canvas) {
      pushStroke({
        ...currentStroke,
        path: createStrokePath(currentStroke.points, canvas.width, canvas.height),
      });
    }

    setCurrentStroke(null);
  };

  return {
    strokes,
    redoStack,
    brushColor,
    brushWidth,
    setBrushColor,
    setBrushWidth,
    handleUndo,
    handleRedo,
    handleClearAll,
    syncCanvasOverlay,
    canvasProps: {
      ref: canvasRef,
      onMouseDown: handleStartDraw,
      onMouseMove: handleMoveDraw,
      onMouseUp: handleEndDraw,
      onMouseLeave: handleEndDraw,
      onTouchStart: handleStartDraw,
      onTouchMove: handleMoveDraw,
      onTouchEnd: handleEndDraw,
      inert: !enabled,
      className: "absolute inset-0",
      style: {
        // position: 'absolute',
        // pointerEvents: enabled ? void 0 : 'none',
        cursor: enabled ? 'crosshair' : void 0,
        zIndex: enabled ? 1 : void 0,
      },
    },
  };
};
