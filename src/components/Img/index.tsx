import { useState, useEffect, type ImgHTMLAttributes } from 'react';

// Extend standard img attributes to include our custom fallback prop
interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export const Img = ({ 
  src, 
  fallback, 
  onError, 
  ...etc 
}: ImgProps) => {
  "use memo";
  const [hasError, setHasError] = useState(false);

  // If the primary src prop changes, reset the error state to try loading the new image
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const handleError = (evt: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Only attempt to use fallback if it was actually provided, 
    // Prevent infinite loops if the fallback image also fails
    if (fallback && !hasError) {
      setHasError(true);
    }

    // If the parent component provided its own onError handler, call it
    onError?.(evt);
  };

  return (
    <img
      loading="lazy"
      decoding="async"
      alt=""

      {...etc} // Override props above

      src={hasError && fallback ? fallback : src}
      onError={handleError}
    />
  );
};

/**
 * With loading state
 */
// export const Img2 = ({ src, fallback, className, onError, onLoad, ...etc }: ImgProps) => {
//   const [hasError, setHasError] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // Reset states if the primary src prop changes
//   useEffect(() => {
//     setHasError(false);
//     setIsLoading(true);
//   }, [src]);

//   const handleLoad = (evt: React.SyntheticEvent<HTMLImageElement, Event>) => {
//     setIsLoading(false); // Image finished loading, remove loading class
    
//     // Call the parent's onLoad if it was provided
//     onLoad?.(evt);
//   };

//   const handleError = (evt: React.SyntheticEvent<HTMLImageElement, Event>) => {
//     setIsLoading(false); // If it fails, it's no longer loading

//     // Only attempt to use fallback if it was actually provided
//     if (!hasError && fallback) {
//       setHasError(true);
//     }

//     // Call the parent's onError if it was provided
//     onError?.(evt);
//   };

//   // Combine any user-provided className with "loading" if isLoading is true
//   // filter(Boolean) removes empty strings so we don't get extra spaces
//   const computedClassName = [className, isLoading ? 'loading' : '']
//     .filter(Boolean)
//     .join(' ');

//   return (
//     <img
//       loading="lazy"
//       decoding="async"

//       {...etc} // Override props above
      
//       src={hasError && fallback ? fallback : src}
//       className={computedClassName || undefined}
//       onLoad={handleLoad}
//       onError={handleError}
//     />
//   );
// };