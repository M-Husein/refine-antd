# <Icon />

## Simple version
```tsx
import { isImageSrc } from '@/utils/checker';

type IconOwnProps = {
  As?: React.ElementType;
  src: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;

  role?: React.AriaRole,
  "aria-hidden"?: boolean,
};

export type IconProps<As extends React.ElementType = "i"> =
  IconOwnProps &
  Omit<React.ComponentPropsWithoutRef<As>, keyof IconOwnProps>;

export const Icon = <As extends React.ElementType = "i">({
  As = "i",
  src, 
  size, 
  className, 
  style, 
  role,
  "aria-hidden": ariaHidden,
  ...etc
}: IconProps<As>) => {
  const isMaskSrc = isImageSrc(src);

  return (
    <As 
      {...etc}
      role={role}

      // Only an icon with role="img" can be exposed to assistive technology.
      aria-hidden={role === "img" ? ariaHidden : true}

      className={`icon ${isMaskSrc ? "i-mask" : "i-text"} ${className || ""}`}
      style={{
        '--src': isMaskSrc ? `url("${src}")` : void 0,
        '--size': typeof size === 'number' ? size + 'px' : size, 
        ...style
      } as React.CSSProperties}
    >
      {!isMaskSrc && src}
    </As>
  );
}
```

## React 19
```tsx
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { isImageSrc } from "@/utils/checker";

type IconOwnProps = {
  As?: React.ElementType;
  src: string;
  size?: number | string;
  lazy?: boolean;
  className?: string;
  style?: React.CSSProperties;

  role?: React.AriaRole;
  "aria-hidden"?: boolean;

  ref?: React.Ref<HTMLElement>;
};

export type IconProps<As extends React.ElementType = "i"> =
  IconOwnProps &
  Omit<React.ComponentPropsWithoutRef<As>, keyof IconOwnProps>;

export const Icon = <As extends React.ElementType = "i">({
  As: Component = "i",
  src,
  size,
  lazy = false,
  className,
  style,
  role,
  "aria-hidden": ariaHidden,
  ref,
  ...etc
}: IconProps<As>) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);

  const isMaskSrc = isImageSrc(src);

  useImperativeHandle(ref, () => elementRef.current!, []);

  useEffect(() => {
    if (!lazy || !isMaskSrc || isVisible || !elementRef.current) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazy, isMaskSrc, isVisible]);

  const shouldRenderSrc = !lazy || isVisible;

  return (
    <Component
      {...etc}
      ref={elementRef}
      role={role}
      // Only an icon with role="img" can be exposed to assistive technology.
      aria-hidden={role === "img" ? ariaHidden : true}
      className={`icon ${isMaskSrc ? "i-mask" : "i-text"} ${className || ""}`}
      style={{
        "--src": isMaskSrc && shouldRenderSrc ? `url("${src}")` : undefined,
        "--size": typeof size === "number" ? `${size}px` : size,
        ...style,
      } as React.CSSProperties}
    >
      {!isMaskSrc && src}
    </Component>
  );
};
```

## React 18
```tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { isImageSrc } from "@/utils/checker";

type IconOwnProps = {
  As?: React.ElementType;
  src: string;
  size?: number | string;
  lazy?: boolean;
  className?: string;
  style?: React.CSSProperties;

  role?: React.AriaRole;
  "aria-hidden"?: boolean;
};

export type IconProps<As extends React.ElementType = "i"> =
  IconOwnProps &
  Omit<React.ComponentPropsWithoutRef<As>, keyof IconOwnProps>;

type IconComponent = <As extends React.ElementType = "i">(
  props: IconProps<As> & {
    ref?: React.Ref<HTMLElement>;
  },
) => React.ReactElement | null;

export const Icon = forwardRef(function Icon<
  As extends React.ElementType = "i"
>(
  {
    As: Component = "i",
    src,
    size,
    lazy = false,
    className,
    style,
    role,
    "aria-hidden": ariaHidden,
    ...etc
  }: IconProps<As>,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);

  const isMaskSrc = isImageSrc(src);

  useImperativeHandle(ref, () => elementRef.current!, []);

  useEffect(() => {
    if (!lazy || !isMaskSrc || isVisible || !elementRef.current) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazy, isMaskSrc, isVisible]);

  const shouldRenderSrc = !lazy || isVisible;

  return (
    <Component
      {...etc}
      ref={elementRef}
      role={role}
      // Only an icon with role="img" can be exposed to assistive technology.
      aria-hidden={role === "img" ? ariaHidden : true}
      className={`icon ${isMaskSrc ? "i-mask" : "i-text"} ${className || ""}`}
      style={{
        "--src": isMaskSrc && shouldRenderSrc
          ? `url("${src}")`
          : undefined,
        "--size": typeof size === "number"
          ? `${size}px`
          : size,
        ...style,
      } as React.CSSProperties}
    >
      {!isMaskSrc && src}
    </Component>
  );
}) as IconComponent;
```

## React 18 with CSS ::after instead of React children
```tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
// import { isImageSrc } from "@/utils/checker";

/**
 * Check if a string is a valid image source (URLs, Data URIs, or Blobs)
 * Returns true for:
 * - Relative paths (/img/user.svg, ./user.svg, ../user.svg)
 * - Absolute URLs (http://, https://)
 * - Data URIs (data:image/...)
 * - Blob URLs (blob:...)
 */
export const isSvgImageSrc = (src: string): boolean => {
  if (!src) return false;

  // const imageSrcRegex = /^(?:https?:\/\/|\/|\.{1,2}\/|blob:|data:image\/(?:svg\+xml|png|jpe?g|gif|webp|avif);)/i;

  return /^(?:https?:\/\/|\/|\.{1,2}\/|blob:|data:image\/(?:svg\+xml|png|jpe?g|gif|webp|avif);)/i.test(src.trim());
};

export type IconProps = {
  As?: React.ElementType;
  src: string;
  fallback?: string;
  size?: number | string;
  lazy?: boolean;
  className?: string;
  style?: React.CSSProperties;
  role?: React.AriaRole;
  "aria-hidden"?: boolean;
  onError?: (error: Event | string) => void;
} & React.HTMLAttributes<HTMLElement>;

export const Icon = forwardRef<HTMLElement, IconProps>(({
  As = "span",
  src,
  fallback,
  size,
  lazy,
  className,
  style,
  role,
  "aria-hidden": ariaHidden,
  onError,
  ...etc
}, ref) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [activeSrc, setActiveSrc] = useState(src || "");
  const [hasError, setHasError] = useState(false);

  const isMask = isSvgImageSrc(activeSrc);

  useImperativeHandle(ref, () => elementRef.current!, []);

  useEffect(() => {
    setActiveSrc(src || "");
    setHasError(false);
  }, [src]);

  // Lazy loading observer
  useEffect(() => {
    if (!lazy || !isMask || isVisible || !elementRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [lazy, isMask, isVisible]);

  // Error validation check
  useEffect(() => {
    if (!isMask || (!isVisible && lazy) || hasError) return;
    let mounted = true;
    const img = new Image();
    img.onerror = (err) => {
      if (!mounted) return;
      setHasError(true);
      onError?.(err);
      if (fallback) setActiveSrc(fallback);
    };
    img.src = activeSrc;
    return () => { mounted = false; };
  }, [activeSrc, isVisible, lazy, isMask, hasError, fallback, onError]);

  // Safe escaping for CSS inline strings
  const escapedSrc = activeSrc.replace(/"/g, '\\"');

  // Compute CSS variable format based on mode:
  // Image Mask -> url("path/to/img.svg")
  // Text/Symbol -> "check_circle" or "✓"
  // const cssSrc = isMask
  //   ? (!lazy || isVisible ? `url("${escapedSrc}")` : undefined)
  //   : `"${escapedSrc}"`;

  return (
    <As
      {...etc}
      ref={elementRef}
      role={role}
      aria-hidden={role === "img" ? ariaHidden : true}
      className={`icon ${isMask ? "i-mask" : "i-text"}${hasError ? " i-error" : ""}${className ? " " + className : ""}`}
      style={{
        '--src': isMask
          ? (!lazy || isVisible ? `url("${escapedSrc}")` : undefined)
          : `"${escapedSrc}"`,
        '--size': typeof size === "number" ? `${size}px` : size,
        ...style,
      } as React.CSSProperties}
    />
  );
});
```

