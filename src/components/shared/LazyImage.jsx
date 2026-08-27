import React, { useState } from "react";

export default function LazyImage({ src, alt = "", className = "", placeholderClassName = "", fallbackIcon }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className={`absolute inset-0 animate-pulse bg-foreground/5 ${placeholderClassName}`} />
      )}
      {error ? (
        <div className={`absolute inset-0 flex items-center justify-center bg-foreground/5 text-foreground/20 ${placeholderClassName}`}>
          {fallbackIcon}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}