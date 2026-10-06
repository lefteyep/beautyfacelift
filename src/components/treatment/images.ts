import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

/**
 * Responsive settings for treatment imagery. Most sources are 3:2 landscape
 * photos shown cover-cropped in taller frames, so the rendered image is wider
 * than its box: `sizes` accounts for that crop factor.
 */
const CANDIDATE_WIDTHS = [360, 540, 720, 960, 1280, 1536];

export function widthsFor(image: ImageMetadata, min = 360): number[] {
  const widths = CANDIDATE_WIDTHS.filter((width) => width >= min && width < image.width);
  return [...widths, Math.min(image.width, CANDIDATE_WIDTHS[CANDIDATE_WIDTHS.length - 1])];
}

/** How much wider than its box a cover-cropped image renders (>= 1). */
export function cropFactor(image: ImageMetadata, frameHeightOverWidth: number): number {
  return Math.max(1, frameHeightOverWidth * (image.width / image.height));
}

/* ── Treatment hero: 4:5 frame (4:3 full-bleed on mobile) ── */

export function treatmentHeroSizes(image: ImageMetadata): string {
  const desktop = cropFactor(image, 5 / 4);
  const mobile = cropFactor(image, 3 / 4);
  return [
    `(min-width: 1440px) ${Math.round(586 * desktop)}px`,
    `(min-width: 901px) ${Math.round(40 * desktop)}vw`,
    `${Math.round(100 * mobile)}vw`,
  ].join(', ');
}

export function treatmentHeroWidths(image: ImageMetadata): number[] {
  return widthsFor(image, 640);
}

/** Preload descriptor for Base.astro — must mirror the <Image> in TreatmentHero. */
export async function treatmentHeroPreload(image: ImageMetadata) {
  const sizes = treatmentHeroSizes(image);
  const result = await getImage({
    src: image,
    widths: treatmentHeroWidths(image),
    sizes,
    format: 'webp',
    quality: 'high',
  });

  return {
    href: result.src,
    imagesrcset: result.srcSet.attribute,
    imagesizes: sizes,
    type: 'image/webp',
    fetchpriority: 'high' as const,
  };
}

/* ── Editorial split image: half the container on desktop ── */

export function splitImageSizes(image: ImageMetadata, frameHeightOverWidth: number, narrow = false): string {
  const factor = cropFactor(image, frameHeightOverWidth);
  const desktopPx = narrow ? 440 : 610;
  const desktopVw = narrow ? 33 : 45;
  return [
    `(min-width: 1440px) ${Math.round(desktopPx * factor)}px`,
    `(min-width: 901px) ${Math.round(desktopVw * factor)}vw`,
    `${Math.round(92 * factor)}vw`,
  ].join(', ');
}
