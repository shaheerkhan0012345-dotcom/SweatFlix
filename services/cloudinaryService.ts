/**
 * Cloudinary CDN Media Delivery Service for SweatFlix
 *
 * Provides optimized HTTPS streaming URLs for 3D exercise video loops and thumbnail images
 * using automatic format selection (f_auto), automatic quality (q_auto), and device-specific scaling.
 */

export const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dkpv0eax8';

export const CLOUDINARY_FOLDER = 'sweatflix';

export interface CloudinaryTransformOptions {
  resourceType?: 'image' | 'video';
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
}

/**
 * Returns true if Cloudinary cloud name is configured
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME.trim().length > 0);
}

/**
 * Builds an optimized Cloudinary delivery URL
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!CLOUDINARY_CLOUD_NAME) return '';

  const {
    resourceType = 'image',
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transforms: string[] = [`f_${format}`, `q_${quality}`];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  if (resourceType === 'video') {
    transforms.push('vc_h264');
  }

  const transformSegment = transforms.join(',');
  const cleanPublicId = publicId.replace(/^\//, '');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${transformSegment}/${cleanPublicId}`;
}

/**
 * Returns an optimized streaming URL for an exercise video
 */
export function getCloudinaryVideoUrl(exerciseKey: string): string {
  const cleanKey = exerciseKey.toLowerCase().replace(/[- ]/g, '_').replace(/\.mp4$/, '');
  const publicId = `${CLOUDINARY_FOLDER}/videos/${cleanKey}`;
  return buildCloudinaryUrl(publicId, {
    resourceType: 'video',
    quality: 'auto',
  });
}

/**
 * Returns an optimized delivery URL for an exercise thumbnail
 */
export function getCloudinaryThumbnailUrl(exerciseKey: string, width = 600): string {
  const cleanKey = exerciseKey.toLowerCase().replace(/[- ]/g, '_').replace(/\.(jpg|png|jpeg)$/, '');
  const publicId = `${CLOUDINARY_FOLDER}/thumbs/${cleanKey}`;
  return buildCloudinaryUrl(publicId, {
    resourceType: 'image',
    width,
    quality: 'auto',
  });
}
