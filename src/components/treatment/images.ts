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

/* ── Treatment hero: 4:5 arch, max 456px wide (4:3 full-width on mobile) ── */

export function treatmentHeroSizes(image: ImageMetadata): string {
  const desktop = cropFactor(image, 5 / 4);
  const mobile = cropFactor(image, 3 / 4);
  return [
    `(min-width: 1280px) ${Math.round(456 * desktop)}px`,
    `(min-width: 901px) ${Math.round(38 * desktop)}vw`,
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

/* ── Editorial split image: 5 of 11 columns on desktop, 4:3 on mobile ── */

export function splitImageSizes(image: ImageMetadata, frameHeightOverWidth: number): string {
  const factor = cropFactor(image, frameHeightOverWidth);
  const mobile = cropFactor(image, 3 / 4);
  return [
    `(min-width: 1280px) ${Math.round(540 * factor)}px`,
    `(min-width: 901px) ${Math.round(40 * factor)}vw`,
    `${Math.round(92 * mobile)}vw`,
  ].join(', ');
}

/* ── Small card image (related treatments, booking panel) ── */

export function cardImageSizes(image: ImageMetadata, frameHeightOverWidth: number, desktopPx: number, desktopVw: number, mobileVw: number): string {
  const factor = cropFactor(image, frameHeightOverWidth);
  return [
    `(min-width: 1280px) ${Math.round(desktopPx * factor)}px`,
    `(min-width: 901px) ${Math.round(desktopVw * factor)}vw`,
    `${Math.round(mobileVw * factor)}vw`,
  ].join(', ');
}
