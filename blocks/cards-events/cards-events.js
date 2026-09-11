import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards Events block
 * List of dated event items: each item has a date, title, description and
 * calendar/info actions. Authors may omit any cell.
 * First cell of a row is treated as the date column; the rest is the body.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    const cells = [...li.children];
    cells.forEach((div, i) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-events-card-image';
      else if (i === 0 && cells.length > 1) div.className = 'cards-events-card-date';
      else div.className = 'cards-events-card-body';
    });
    // Tag the inert "Add to calendar" affordance so CSS can style it as a pill
    // with a calendar icon (source is a JS widget button with no navigable URL).
    const body = li.querySelector('.cards-events-card-body');
    if (body) {
      const addCal = [...body.querySelectorAll('p')]
        .find((p) => !p.querySelector('a') && /^add to calendar$/i.test(p.textContent.trim()));
      const moreInfo = body.querySelector('p:has(> a)');
      if (addCal) addCal.className = 'cards-events-add-to-calendar';
      // Group the two actions ("More information" + "Add to calendar") into a
      // horizontal row, matching the source's side-by-side layout.
      if (addCal && moreInfo) {
        const actions = document.createElement('div');
        actions.className = 'cards-events-actions';
        moreInfo.before(actions);
        actions.append(moreInfo, addCal);
      }
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
