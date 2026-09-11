/*
 * Cards Facts block
 * Grid of statistic items: each item has a prominent figure (heading) plus a
 * bold label and short description. Text-focused — no images.
 *
 * Source behaviour (telekom.com): the first item (live share price) is always
 * open, showing figure + label + date + change. Every subsequent item is a
 * COLLAPSIBLE row — only the figure + bold label are shown; the description
 * reveals when the row is toggled (chevron). We mirror that: item 0 stays
 * fully visible; items 1+ get a disclosure toggle with the detail collapsed.
 */

const CHEVRON = `<svg class="cards-facts-chevron" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');

    // Collect all authored content from the row's cell(s).
    const content = document.createElement('div');
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });

    // Figure = the heading (prominent number/stat).
    const figureEl = content.querySelector('h1, h2, h3, h4, h5, h6');
    const figure = document.createElement('div');
    figure.className = 'cards-facts-figure';
    if (figureEl) figure.append(figureEl);

    // Text = everything else (label + description lines).
    const text = document.createElement('div');
    text.className = 'cards-facts-text';
    while (content.firstElementChild) text.append(content.firstElementChild);

    if (figure.childElementCount) li.append(figure);
    if (text.childElementCount) li.append(text);

    // The first item (live share price) is always open. Subsequent items are
    // collapsible: keep the bold label visible, collapse the rest.
    const label = text.querySelector('p:has(strong), p:first-child');
    const detailParas = [...text.children].filter((el) => el !== label);
    if (index > 0 && label && detailParas.length) {
      const detailId = `cards-facts-detail-${index}`;
      const detail = document.createElement('div');
      detail.className = 'cards-facts-detail';
      detail.id = detailId;
      detail.hidden = true;
      detailParas.forEach((p) => detail.append(p));

      // Make the label row a disclosure toggle with a chevron.
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'cards-facts-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', detailId);
      while (label.firstChild) toggle.append(label.firstChild);
      toggle.insertAdjacentHTML('beforeend', CHEVRON);
      label.replaceWith(toggle);
      text.append(detail);

      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        detail.hidden = open;
      });
    }

    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
