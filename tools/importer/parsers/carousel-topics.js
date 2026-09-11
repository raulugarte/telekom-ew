/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-topics. Base: carousel.
 * Source: https://www.telekom.com/en (.teasergroupslider.theme-orchid section.teaser-group)
 * Generated for DA project.
 *
 * Carousel convention: 2 columns, one row per slide.
 *   Row 1: block name (handled by createBlock).
 *   Each slide row: cell 1 = image only (mandatory), cell 2 = text content
 *   (title, description, CTA).
 * carousel-topics decorate treats a single-picture cell as the slide image and
 * the rest as the slide body. DM images/anchors are preserved as-is (carrier
 * anchors are produced by the transformer downstream).
 */
export default function parse(element, { document }) {
  // Each topic teaser is an <li class="teaser-group__item"> holding an <article>.
  let items = element.querySelectorAll('li.teaser-group__item');
  if (!items.length) items = element.querySelectorAll('article.teaser');

  const cells = [];
  items.forEach((item) => {
    const article = item.matches('article') ? item : item.querySelector('article');
    const scope = article || item;

    // Image cell: DM picture preserved as-is (image only, no other content).
    const picture = scope.querySelector('.teaser__media picture, picture');
    const mediaImg = scope.querySelector('.teaser__media-image, .teaser__media img');
    const imageCell = picture || mediaImg || '';

    // Body cell: heading (with its link preserved) and optional description.
    const heading = scope.querySelector('.teaser__title, h2, h3, h4');
    const text = scope.querySelector('.teaser__text, p');
    const bodyCell = [];
    if (heading) bodyCell.push(heading);
    if (text) bodyCell.push(text);

    // Skip empty slides.
    if (bodyCell.length === 0 && !picture && !mediaImg) return;

    cells.push([imageCell, bodyCell.length ? bodyCell : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-topics', cells });
  element.replaceWith(block);
}
