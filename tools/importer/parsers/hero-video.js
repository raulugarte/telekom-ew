/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video. Base: hero (canonicalModel: standalone).
 * Source: https://www.telekom.com/en (.stagevideo)
 * Generated for DA project.
 *
 * Hero convention: 1 column.
 *   Row 1: block name (handled by createBlock).
 *   Row 2: background asset (background video link and/or poster picture).
 *   Row 3: title (+ optional subheading / CTA).
 * DM/Scene7 images are preserved as-is; the transformer converts them to
 * carrier anchors downstream.
 */
export default function parse(element, { document }) {
  // Heading overlaid on the stage (may be visually hidden in source).
  const heading = element.querySelector('h1, h2, .video-player h1, [class*="title"]');

  // Poster / fallback image (DM picture) — preserve as-is for the transformer.
  const poster = element.querySelector('.video-player__poster-picture, picture');

  // Background video source (manifest or file). Preserve the URL as a link so
  // it survives import; hero-video decorate promotes video links to background.
  const videoEl = element.querySelector('video[src], video source[src]');
  const videoSrc = videoEl
    ? (videoEl.getAttribute('src') || videoEl.querySelector('source[src]')?.getAttribute('src'))
    : null;
  let videoLink = null;
  if (videoSrc) {
    videoLink = document.createElement('a');
    videoLink.href = videoSrc;
    videoLink.textContent = videoSrc;
  }

  // Background asset cell (row 2): video link and/or poster picture.
  const bgCell = [];
  if (videoLink) bgCell.push(videoLink);
  if (poster) bgCell.push(poster);

  // Content cell (row 3): heading.
  const contentCell = [];
  if (heading) contentCell.push(heading);

  // Empty-block guard: nothing meaningful to render.
  if (bgCell.length === 0 && contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // hero is single-column: one cell per row.
  const cells = [];
  cells.push([bgCell.length ? bgCell : '']);
  cells.push([contentCell.length ? contentCell : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
