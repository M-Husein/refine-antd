// import { cn } from 'q-js-utils/cn';

// type AriaCurrent = boolean | "page" | "step" | "location" | "date" | "time" | "true" | "false";

export interface AProps extends React.ComponentPropsWithRef<'a'> {
  As?: React.ElementType,
  disabled?: boolean,
  // active?: AriaCurrent,
  to?: string,
}

/**
 * Link component with enhanced features.
 * - Adds disabled state (prevents clicks, sets inert)
 * - Handles inert gracefully with fallback tabIndex
 * 
 * @prop disabled – disables the link (prevents clicks, sets inert if supported)
 * @props other link props/attribute.
 */
export const A = ({
  As = "a",
  // "aria-current": ariaCurrent,
  // active,
  disabled,
  draggable,
  // href,
  inert,
  tabIndex,
  onClick,
  ...etc
}: AProps) => {
  const handleClick = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    if(disabled || inert){
      evt.preventDefault();
      return;
    }
    onClick?.(evt);
  };

  return (
    <As 
      // href and aria-current first to support react-router Link & NavLink component
      // href={disabled ? void 0 : href} // Remove href when disabled
      // aria-current={ariaCurrent ?? active}

      {...etc}
      
      aria-disabled={disabled}
      inert={inert ?? disabled}
      disabled={disabled}
      tabIndex={disabled ? -1 : tabIndex}
      draggable={disabled ? false : draggable}
      onClick={handleClick}

      // Optional: more strict
      // onMouseEnter={(evt: any) => disabled && evt?.target.removeAttribute('href')}
    />
  );
};

// A.displayName = "A";
