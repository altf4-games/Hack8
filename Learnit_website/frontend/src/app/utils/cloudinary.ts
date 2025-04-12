// Cloudinary configuration and utilities

/**
 * Cloudinary configuration object
 */
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  apiSecret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  uploadPreset: "learnit_uploads", // You can set this up in your Cloudinary dashboard
};

/**
 * Upload a file to Cloudinary
 * @param file The file to upload
 * @param folder Optional folder path within Cloudinary
 * @returns Promise with the upload result
 */
export const uploadToCloudinary = async (file: File, folder = "notes"): Promise<any> => {
  if (!cloudinaryConfig.cloudName) {
    throw new Error("Cloudinary configuration is missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);
  formData.append("folder", folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

/**
 * Generate a Cloudinary URL for an image
 * @param publicId The public ID of the image
 * @param options Options for transforming the image
 * @returns The URL for the image
 */
export const getCloudinaryUrl = (publicId: string, options = {}): string => {
  if (!cloudinaryConfig.cloudName) {
    console.error("Cloudinary configuration is missing");
    return "";
  }

  // Default options
  const defaultOptions = {
    width: "auto",
    crop: "scale",
    quality: "auto",
    format: "auto",
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const transformations = Object.entries(mergedOptions)
    .map(([key, value]) => `${key}_${value}`)
    .join(",");

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformations}/${publicId}`;
};

/**
 * Get an optimized thumbnail version of an image
 * @param publicId The public ID of the image
 * @param width Width of the thumbnail
 * @returns Thumbnail URL
 */
export const getThumbnail = (publicId: string, width = 300): string => {
  return getCloudinaryUrl(publicId, {
    width,
    height: width,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    fetch_format: "auto",
  });
};

/**
 * Get a responsive image URL with automatic format and quality
 * @param publicId The public ID of the image
 * @param maxWidth Maximum width of the image
 * @returns Optimized image URL
 */
export const getResponsiveImage = (publicId: string, maxWidth = 1200): string => {
  return getCloudinaryUrl(publicId, {
    width: maxWidth,
    crop: "limit",
    quality: "auto",
    fetch_format: "auto",
  });
};

/**
 * Get a blurred placeholder image for lazy loading
 * @param publicId The public ID of the image
 * @returns Blurred placeholder URL
 */
export const getBlurredPlaceholder = (publicId: string): string => {
  return getCloudinaryUrl(publicId, {
    width: 100,
    effect: "blur:1000",
    quality: 10,
  });
};

/**
 * Get srcset for responsive images
 * @param publicId The public ID of the image
 * @param widths Array of widths for the srcset
 * @returns A srcset string for use in <img> or <source> elements
 */
export const getSrcSet = (publicId: string, widths = [300, 600, 900, 1200, 1800]): string => {
  return widths
    .map((width) => {
      const url = getCloudinaryUrl(publicId, {
        width,
        crop: "scale",
        quality: "auto",
        fetch_format: "auto",
      });
      return `${url} ${width}w`;
    })
    .join(", ");
}; 