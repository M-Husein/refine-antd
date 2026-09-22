export interface PlaceholderProps
  extends Omit<
    React.SVGProps<SVGSVGElement>,
    "children" | "fill" // | "title" | "width" | "height" | 
  > {
  content?: React.ReactNode;
  bg?: string;
  color?: string;
  fontSize?: string | number;
  contentProps?: Record<string, any>;

  /** To prepend React node such as <style />, <title /> */
  start?: React.ReactNode;
}

/**
 * Component for placeholder image.
 * 
 * @props content?: React.ReactNode - Text displayed in the center of the placeholder (default: "?")
 * @props start?: React.ReactNode - To prepend React node such as <style />, <title />
 * @props bg?: string - Background color (default: "#868e96")
 * @props color?: string - Text color (default: "#eee")
 * @props contentProps?: Record<string, any> - <text /> props
 * @returns <svg />
 */
export const Placeholder = ({ 
  width = "100%",
  height = "100%",
  content = "?", 
  bg = "#868e96", 
  color = "#eee", // "#dee2e6"
  fontSize,
  // "aria-label": ariaLabel,
  start,
  contentProps,
  ...etc
}: PlaceholderProps) => {
  return (
    <svg 
      role="img" 
			aria-hidden={true} 
			focusable={false} 

      {...etc}

      width={width}
      height={height}

      preserveAspectRatio="xMidYMid slice" 
      xmlns="http://www.w3.org/2000/svg"
      // aria-label={ariaLabel ?? title ?? text}
    >
      {start}

      <rect 
        width={width}
        height={height}
        fill={bg}
      />

      {typeof content === 'string' ? 
        <text 
          {...contentProps}
          x="50%" 
          y="50%" 
          // dy=".3em"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fill={color} 
        >
          {content}
        </text>
        : 
        <foreignObject
          {...contentProps}
          width={width}
          height={height}
          x="0" 
          y="0" 
        >
          <div 
            className="grid place-content-center w-full h-full"
            style={{
              ...contentProps?.style, 
              color,
              fontSize,
            }} 
          >
            {content}
          </div>
        </foreignObject>
      }
    </svg>
  );
};

// Placeholder.displayName = "Placeholder";
