/*
 * Carousel Topics block
 * Horizontal sliding track of topic teasers, each with an image and a heading.
 * Multiple teasers are visible at once; the track scrolls horizontally with
 * prev/next controls. Authors add one row per topic (image + heading).
 */

function scrollByPage(track, direction) {
  const amount = track.clientWidth * 0.8 * direction;
  track.scrollBy({ left: amount, top: 0, behavior: 'smooth' });
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.classList.add('carousel-topics-track');

  [...block.children].forEach((row) => {
    const item = document.createElement('li');
    item.classList.add('carousel-topics-item');
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.classList.add('carousel-topics-item-image');
      } else {
        cell.classList.add('carousel-topics-item-body');
      }
      item.append(cell);
    }
    track.append(item);
    row.remove();
  });

  const nav = document.createElement('div');
  nav.classList.add('carousel-topics-navigation-buttons');
  nav.innerHTML = `
    <button type="button" class="slide-prev" aria-label="Previous"></button>
    <button type="button" class="slide-next" aria-label="Next"></button>
  `;

  block.textContent = '';
  block.append(track, nav);

  nav.querySelector('.slide-prev').addEventListener('click', () => scrollByPage(track, -1));
  nav.querySelector('.slide-next').addEventListener('click', () => scrollByPage(track, 1));
}
