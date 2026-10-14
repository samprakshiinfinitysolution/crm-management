"use client";

import React, { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export interface CloudinaryUrlOptions {
  cloudinaryBaseUrl?: string;
  quality?: "auto" | "best" | "good" | "eco" | "low" | number | `${number}` | string;
  blurWidth?: number;
  blurAmount?: number;
}

/**
 * Generates high-res and tiny blur placeholder URLs for Cloudinary assets.
 * Gracefully passes through non-Cloudinary / local URLs.
 */
export function getCloudinaryAdaptiveUrls(
  srcOrBaseId: string,
  options: CloudinaryUrlOptions = {}
): { highResUrl: string; blurUrl?: string } {
  const {
    cloudinaryBaseUrl = "https://res.cloudinary.com",
    quality = "auto",
    blurWidth = 40,
    blurAmount = 1000,
  } = options;

  if (!srcOrBaseId) {
    return { highResUrl: "", blurUrl: undefined };
  }

  let fullUrl = srcOrBaseId;

  // If provided a bare baseId like 'v1234567/sample.jpg' or without protocol
  if (
    !fullUrl.startsWith("http://") &&
    !fullUrl.startsWith("https://") &&
    !fullUrl.startsWith("/")
  ) {
    const cleanBase = cloudinaryBaseUrl.replace(/\/+$/, "");
    fullUrl = cleanBase.includes("/image/upload")
      ? `${cleanBase}/${fullUrl}`
      : `${cleanBase}/image/upload/${fullUrl}`;
  }

  const uploadMarker = "/image/upload/";
  const uploadIndex = fullUrl.indexOf(uploadMarker);

  if (uploadIndex !== -1) {
    const base = fullUrl.slice(0, uploadIndex + uploadMarker.length);
    const rest = fullUrl.slice(uploadIndex + uploadMarker.length);

    // Extract public asset path after any existing transformation segments
    const vMatch = rest.match(/^(?:.*\/)?(v\d+\/.*)$/);
    const publicPath = vMatch && vMatch[1] ? vMatch[1] : rest;

    const highResUrl = `${base}f_auto,q_${quality}/${publicPath}`;
    const blurUrl = `${base}f_auto,q_auto:low,w_${blurWidth},e_blur:${blurAmount}/${publicPath}`;

    return { highResUrl, blurUrl };
  }

  // Non-Cloudinary fallback
  return { highResUrl: fullUrl, blurUrl: undefined };
}

export interface CloudinaryAdaptiveImageProps
  extends Omit<ImageProps, "src" | "placeholder" | "blurDataURL" | "quality"> {
  src?: string;
  baseId?: string;
  cloudinaryBaseUrl?: string;
  quality?: number | `${number}` | "auto" | "best" | "good" | "eco" | "low" | string;
  blurWidth?: number;
  blurAmount?: number;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  /**
   * When true (default), observes the enclosing <section> element so the
   * image starts loading as soon as that section enters the viewport.
   * If false or if no <section> is found, observes the image container itself.
   */
  observeSection?: boolean;
  sectionId?: string;
  rootMargin?: string;
  threshold?: number;
  children?: React.ReactNode;
}

export function CloudinaryAdaptiveImage({
  src = "",
  baseId,
  cloudinaryBaseUrl,
  alt,
  fill,
  width,
  height,
  sizes,
  priority = false,
  quality = "auto",
  blurWidth = 40,
  blurAmount = 1000,
  className,
  wrapperClassName,
  wrapperStyle,
  style,
  objectFit,
  observeSection = true,
  sectionId,
  rootMargin = "0px",
  threshold = 0.01,
  unoptimized,
  children,
  onLoad,
  ...restProps
}: CloudinaryAdaptiveImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState<boolean>(() => {
    if (priority) return true;
    if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
      return true;
    }
    return false;
  });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Compute adaptive URLs
  const targetSrc = src || baseId || "";
  const { highResUrl, blurUrl } = getCloudinaryAdaptiveUrls(targetSrc, {
    cloudinaryBaseUrl,
    quality,
    blurWidth,
    blurAmount,
  });

  // Section-aware / Container-aware Viewport Lazy Loading Observer
  useEffect(() => {
    if (priority || isInView) return;

    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const targetElement =
      (sectionId ? document.getElementById(sectionId) : null) ||
      (observeSection ? container.closest("section") : null) ||
      container;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && (entry.isIntersecting || entry.intersectionRatio > 0)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(targetElement);

    return () => {
      observer.disconnect();
    };
  }, [priority, isInView, observeSection, sectionId, rootMargin, threshold]);

  // Merge styling
  const mergedImageStyle: React.CSSProperties = {
    ...(objectFit ? { objectFit } : {}),
    ...style,
  };

  const containerStyle: React.CSSProperties = {
    ...(!fill && width && height
      ? { aspectRatio: `${width} / ${height}` }
      : {}),
    ...wrapperStyle,
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={cn(
        "relative overflow-hidden",
        fill ? "w-full h-full" : "w-full",
        wrapperClassName
      )}
    >
      {/* Background Pulse Skeleton (visible until image completes loading) */}
      <div
        className={cn(
          "absolute inset-0 bg-slate-100 dark:bg-slate-900/80 transition-opacity duration-700 pointer-events-none z-0",
          isLoaded ? "opacity-0" : "opacity-100 animate-pulse"
        )}
        aria-hidden="true"
      />

      {/* High-Resolution Cloudinary Image with Blur Placeholder */}
      {isInView && highResUrl ? (
        <Image
          src={highResUrl}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          sizes={sizes}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          unoptimized={unoptimized}
          placeholder={blurUrl ? "blur" : undefined}
          blurDataURL={blurUrl}
          style={mergedImageStyle}
          className={cn(
            "relative z-1 transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={(e) => {
            setIsLoaded(true);
            onLoad?.(e);
          }}
          {...restProps}
        />
      ) : null}

      {/* Overlay contents, badges, and labels */}
      {children ? <div className="relative z-2">{children}</div> : null}
    </div>
  );
}

export default CloudinaryAdaptiveImage;
