import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards News block
 * News teaser cards: each card has an optional category label, image, heading,
 * description and a "Learn more" CTA. Authors may omit any cell.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-news-card-image';
      } else {
        div.className = 'cards-news-card-body';
        // A leading text-only <p> before the heading is the category label.
        const first = div.firstElementChild;
        if (first && first.tagName === 'P' && !first.querySelector('a') && div.querySelector('h1,h2,h3,h4,h5,h6')) {
          first.className = 'cards-news-label';
        }
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
