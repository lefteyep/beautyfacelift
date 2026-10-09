// JPG crops of a page photo for link previews (og:image) and the Article schema.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export interface CroppedImage {
  src: string;
  width: number;
  height: number;
}

/**
 * Crops `source` to `ratio` (width / height) as a JPG, at most `maxWidth` wide and never larger
 * than the source in either direction. `position` is the crop focus, as CSS object-position.
 */
export async function cropImage(
  source: ImageMetadata,
  ratio: number,
  position = 'center',
  maxWidth = 1200,
): Promise<CroppedImage> {
  let width = Math.min(maxWidth, source.width);
  let height = Math.round(width / ratio);
  if (height > source.height) {
    height = source.height;
    width = Math.round(height * ratio);
  }
  const image = await getImage({ src: source, width, height, fit: 'cover', position, format: 'jpg', quality: 80 });
  return { src: image.src, width, height };
}

/** Link previews are 1.91:1 (1200×630). */
export const OG_RATIO = 1200 / 630;

/** Google's recommended Article image shapes: 16:9, 4:3 and 1:1. */
export const ARTICLE_IMAGE_RATIOS = [16 / 9, 4 / 3, 1];
