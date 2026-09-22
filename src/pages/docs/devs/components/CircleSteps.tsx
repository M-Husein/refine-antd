// import './CircleSteps.scss';
// import { type ReactNode } from 'react';

export interface CircleStepItem {
  id: string | number;
  label?: React.ReactNode;
  title?: string;
  color?: string;
}

export interface CircleStepsProps extends React.SVGProps<SVGSVGElement> {
  /** Array of step items */
  items: CircleStepItem[];

  /** Default fallback color for all items */
  itemsColor?: string;

  /** Gap between slices in degrees (e.g. 2, 4, 8) */
  gap?: number;

  /** Content to display inside the center of the ring */
  content?: React.ReactNode;

  /** To prepend React node such as <style /> */
  start?: React.ReactNode;
}

const OUTER_RADIUS = 290;
const INNER_RADIUS = 174;
const LABEL_RADIUS = (OUTER_RADIUS + INNER_RADIUS) / 2;
const FOREIGN_OBJECT_SIZE = INNER_RADIUS * 2;

export const CircleSteps: React.FC<CircleStepsProps> = ({
  items = [],
  itemsColor = "#ffa500",
  gap = 0,
  content,
  start,
  ...etc
}) => {
  const total = items.length;

  const renderSlices = (item: CircleStepItem, index: number) => {
    const color = item.color || itemsColor;

    if (total === 1 && gap <= 0) {
      const fullRingPath =
        `M 0 -${OUTER_RADIUS} ` +
        `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 1 0 0 ${OUTER_RADIUS} ` +
        `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 1 0 0 -${OUTER_RADIUS} Z ` +
        `M 0 -${INNER_RADIUS} ` +
        `A ${INNER_RADIUS} ${INNER_RADIUS} 0 1 1 0 ${INNER_RADIUS} ` +
        `A ${INNER_RADIUS} ${INNER_RADIUS} 0 1 1 0 -${INNER_RADIUS} Z`;

      return (
        <path
          key={item.id ?? index}
          className="cursor-pointer hover_opacity-45" // circle-steps-slice
          d={fullRingPath}
          fill={color}
          fillRule="evenodd"
        >
          {item.title && <title>{item.title}</title>}
        </path>
      );
    }

    const angleStep = (2 * Math.PI) / total;
    const gapRad = (gap * Math.PI) / 180;
    const effectiveAngle = Math.max(0, angleStep - gapRad);

    // Angle start (12 o'clock clockwise direction)
    const a1 = -Math.PI / 2 + index * angleStep + gapRad / 2;
    const a2 = a1 + effectiveAngle;

    // Outer arc coordinates
    const x1_out = (OUTER_RADIUS * Math.cos(a1)).toFixed(3);
    const y1_out = (OUTER_RADIUS * Math.sin(a1)).toFixed(3);
    const x2_out = (OUTER_RADIUS * Math.cos(a2)).toFixed(3);
    const y2_out = (OUTER_RADIUS * Math.sin(a2)).toFixed(3);

    // Inner arc coordinates
    const x1_in = (INNER_RADIUS * Math.cos(a1)).toFixed(3);
    const y1_in = (INNER_RADIUS * Math.sin(a1)).toFixed(3);
    const x2_in = (INNER_RADIUS * Math.cos(a2)).toFixed(3);
    const y2_in = (INNER_RADIUS * Math.sin(a2)).toFixed(3);

    const largeArc = effectiveAngle > Math.PI ? 1 : 0;

    // Outer arc moves clockwise (sweep-flag = 1), inner arc returns counter-clockwise (sweep-flag = 0)
    const pathData =
      `M ${x1_out} ${y1_out} ` +
      `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArc} 1 ${x2_out} ${y2_out} ` +
      `L ${x2_in} ${y2_in} ` +
      `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 0 ${x1_in} ${y1_in} Z`;

    return (
      <path
        key={item.id ?? index}
        className="cursor-pointer hover_opacity-45" // circle-steps-slice
        d={pathData}
        fill={color}
      >
        {item.title && <title>{item.title}</title>}
      </path>
    );
  };

  const renderTextLabels = (item: CircleStepItem, index: number) => {
    const angleStep = (2 * Math.PI) / total;
    // Mid-angle calculated clockwise from 12 o'clock
    const midAngle = -Math.PI / 2 + (index + 0.5) * angleStep;

    return (
      <text
        key={item.id ?? index}
        className="font-bold text-7xl pe-none select-none" // circle-steps-label
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        x={(LABEL_RADIUS * Math.cos(midAngle)).toFixed(3)}
        y={(LABEL_RADIUS * Math.sin(midAngle)).toFixed(3)}
      >
        {item.label ?? index + 1}
      </text>
    );
  };

  return (
    <svg
      width="100%"
      height="100%"
      
      {...etc}

      viewBox="-300 -300 600 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      {start}

      {/* Render Slices */}
      <g>{items.map(renderSlices)}</g>

      {/* Inner White Hole */}
      <circle 
        cx="0" 
        cy="0" 
        r={INNER_RADIUS} 
        fill="#fff" 
      />

      {/* Render Text Labels */}
      <g>{items.map(renderTextLabels)}</g>

      {/* Render Center Content */}
      {content && (
        <foreignObject
          x={-INNER_RADIUS}
          y={-INNER_RADIUS}
          width={FOREIGN_OBJECT_SIZE}
          height={FOREIGN_OBJECT_SIZE}
          className="rounded-full"
        >
          <div 
            // circle-steps-center
            className="grid place-content-center w-full h-full rounded-full"
          >
            {content}
          </div>
        </foreignObject>
      )}
    </svg>
  );
};
