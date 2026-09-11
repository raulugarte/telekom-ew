/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-facts. Base: cards (canonicalModel: cards).
 * Source: https://www.telekom.com/en (.facts-outer .facts)
 * Generated for DA project.
 *
 * This variant is text-focused with no images → "Cards (no images)" convention:
 *   1 column, multiple rows.
 *   Row 1: block name (handled by createBlock).
 *   Each fact row: a single cell containing the figure (heading), the label
 *   and the short description.
 * Source markup is an accordion where each item is a stat: a prominent figure
 * (accordion__title / stock-price), a label (accordion__header-subtitle) and an
 * optional description in the panel body. Base64 SVG icons are dropped.
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.accordion__item');

  const cells = [];
  items.forEach((item) => {
    const contentCell = [];

    // Figure — the prominent number/value. Stock item uses a dedicated price span.
    const figureText = (
      item.querySelector('.accordion__stock-price')
      || item.querySelector('.accordion__title')
    );
    if (figureText && figureText.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = figureText.textContent.trim();
      contentCell.push(h);
    }

    // Label — the subtitle describing the figure.
    const label = item.querySelector('.accordion__header-subtitle, .accordion__stock-company');
    if (label && label.textContent.trim()) {
      const p = document.createElement('p');
      p.innerHTML = `<strong>${label.textContent.trim()}</strong>`;
      contentCell.push(p);
    }

    // Stock-specific extra info (timestamp / change), if present.
    const timestamp = item.querySelector('.accordion__stock-timestamp');
    const change = item.querySelector('.accordion__stock-change');
    [timestamp, change].forEach((node) => {
      if (node && node.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = node.textContent.trim();
        contentCell.push(p);
      }
    });

    // Description — the panel body paragraphs.
    const bodyParas = item.querySelectorAll('.accordion__panel .teaser__text p, .accordion__body p');
    bodyParas.forEach((p) => {
      if (p.textContent.trim()) contentCell.push(p);
    });

    // Skip empty facts.
    if (contentCell.length === 0) return;

    // No-images cards variant: single cell per row.
    cells.push([contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-facts', cells });
  element.replaceWith(block);
}
