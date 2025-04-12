"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getCloudinaryUrl, getBlurredPlaceholder, getSrcSet } from "../../utils/cloudinary";

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

/**
 * A component to easily display optimized images from Cloudinary
 */
const CloudinaryImage = ({
  publicId,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 80,
  sizes = "100vw",
  fill = false,
  style,
}: CloudinaryImageProps) => {
  const [blurDataUrl, setBlurDataUrl] = useState<string>("");
  
  useEffect(() => {
    // Generate a blur placeholder for the image
    setBlurDataUrl(getBlurredPlaceholder(publicId));
  }, [publicId]);
  
  // Generate the URL for the image using Cloudinary's optimizations
  const imageUrl = getCloudinaryUrl(publicId, {
    quality,
    fetch_format: "auto",
  });
  
  // Generate srcset for responsive images
  const srcSet = getSrcSet(publicId);
  
  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      quality={quality}
      sizes={sizes}
      placeholder={blurDataUrl ? "blur" : "empty"}
      blurDataURL={blurDataUrl}
      fill={fill}
      style={style}
    />
  );
};

export default CloudinaryImage; 