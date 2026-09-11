/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-events. Base: cards (canonicalModel: cards).
 * Source: https://www.telekom.com/en (.events-teaser)
 * Generated for DA project.
 *
 * Cards convention: 2 columns, multiple rows.
 *   Row 1: block name (handled by createBlock).
 *   Each event row: cell 1 = date column, cell 2 = body (title, description,
 *   CTAs). cards-events decorate treats the first cell of a multi-cell row as
 *   the date and the rest as the body.
 * The section also has an optional featured image; it is emitted as its own
 * row (image cell + empty body) so it is preserved. DM images/anchors are kept
 * as-is (carrier anchors are produced by the transformer downstream). Base64
 * SVG icons and non-linked calendar buttons are dropped.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Optional featured image for the section (preserve the DM picture as-is).
  const featured = element.querySelector('.events-teaser__featured-image picture, .events-teaser__featured-image img');
  if (featured) {
    cells.push([featured, '']);
  }

  const items = element.querySelectorAll('.events-teaser__event-item');
  items.forEach((item) => {
    // Date column.
    const date = item.querySelector('.teaser__pre-header');
    const dateCell = [];
    if (date && date.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = date.textContent.trim();
      dateCell.push(p);
    }

    // Body: title, description, and CTA link (calendar buttons have no href → skip).
    const bodyCell = [];
    // Title lives in .teaser__title (its inner link is preserved). Avoid a bare
    // h3/h4 fallback here — the date pre-header is also an h3.
    const heading = item.querySelector('.teaser__content .teaser__title, .teaser__title');
    if (heading) bodyCell.push(heading);
    const text = item.querySelector('.teaser__text, .teaser__content p');
    if (text) bodyCell.push(text);
    // CTA is the explicit action button link (e.g. "More information"); the
    // title's own link is left inside the heading.
    const ctaLink = item.querySelector('.teaser__cta a[href]');
    if (ctaLink) {
      const p = document.createElement('p');
      p.append(ctaLink);
      bodyCell.push(p);
    }
    // "Add to calendar" — a JS widget button in the source (no href). Preserve
    // it as an inert labelled entry; the block's decorate() styles it as a
    // pill with a calendar icon. Emitted as a marked <p> so it is distinct
    // from the navigable "More information" CTA above.
    const addCal = [...item.querySelectorAll('button, a')]
      .find((el) => /add to calendar/i.test(el.textContent));
    if (addCal) {
      const p = document.createElement('p');
      p.textContent = 'Add to calendar';
      p.setAttribute('data-cta', 'add-to-calendar');
      bodyCell.push(p);
    }

    // Skip empty events.
    if (dateCell.length === 0 && bodyCell.length === 0) return;

    cells.push([dateCell.length ? dateCell : '', bodyCell.length ? bodyCell : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-events', cells });

  // Preserve the section heading ("Upcoming events") as default content before
  // the block — the block selector wraps the whole .events-teaser section, so
  // without this the H2 would be consumed and lost.
  const sectionHeading = element.querySelector('.events-teaser__header h2, .events-teaser__title, h2');
  const frag = document.createDocumentFragment();
  if (sectionHeading && sectionHeading.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = sectionHeading.textContent.trim();
    frag.append(h2);
  }
  frag.append(block);
  element.replaceWith(frag);
}
