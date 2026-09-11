/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://www.telekom.com/en (.feed-outer .teaser-group__grid)
 * Generated for DA project.
 *
 * Cards convention: 2 columns.
 *   Row 1: block name (handled by createBlock).
 *   Each card row: cell 1 = image (mandatory), cell 2 = text content
 *   (heading, description, CTA).
 * DM images/anchors are preserved as-is (carrier anchors are produced by the
 * transformer downstream).
 */
export default function parse(element, { document }) {
  // Each news teaser is an <li class="teaser-group__item"> holding an <article>.
  // Select one node per card. Prefer the <li> items; fall back to bare
  // articles only when no list items exist (mutually exclusive to avoid
  // double-selecting an <li> and its inner <article>).
  let items = element.querySelectorAll('li.teaser-group__item');
  if (!items.length) items = element.querySelectorAll('article.teaser');

  const cells = [];
  items.forEach((item) => {
    const article = item.matches('article') ? item : item.querySelector('article');
    const scope = article || item;

    // Image cell: prefer the picture (DM asset) inside the media wrapper.
    const picture = scope.querySelector('.teaser__media picture, picture');
    const mediaImg = scope.querySelector('.teaser__media-image, .teaser__media img');
    const imageCell = picture || mediaImg || '';

    // Body: optional category label, heading, description, and the primary CTA link.
    const heading = scope.querySelector('.teaser__title, h2, h3, h4');
    const text = scope.querySelector('.teaser__text, p');
    const headingLink = heading && heading.querySelector('a[href]');
    const ctaLink = scope.querySelector('.teaser__cta a[href], a.teaser__link[href]');

    // Category label (e.g. "B2C", "B2B Digital Companies") — the source renders
    // it as a small pill above the heading. Emit it as a leading paragraph so
    // the block's decorate() can tag it (.cards-news-label).
    const labelEl = scope.querySelector('.teaser__label, .teaser__labels a');
    const labelText = labelEl ? labelEl.textContent.replace(/\s+/g, ' ').trim() : '';

    const bodyCell = [];
    if (labelText) {
      const labelP = document.createElement('p');
      labelP.textContent = labelText;
      bodyCell.push(labelP);
    }
    if (heading) bodyCell.push(heading);
    if (text) bodyCell.push(text);
    const href = (ctaLink && ctaLink.getAttribute('href')) || (headingLink && headingLink.getAttribute('href'));
    if (href) {
      const cta = document.createElement('a');
      cta.href = href;
      cta.textContent = 'Learn more';
      const p = document.createElement('p');
      p.append(cta);
      bodyCell.push(p);
    }

    // Skip empty cards.
    if (bodyCell.length === 0 && !picture && !mediaImg) return;

    cells.push([imageCell, bodyCell.length ? bodyCell : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
