import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Mobile/desktop breakpoint (matches the header + source footer behaviour).
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Wires a footer link group (heading + its <ul>) as a mobile accordion,
 * mirroring telekom.com: on mobile the heading is a toggle button that
 * expands/collapses its list; on desktop the list is always shown.
 * @param {Element} heading the group heading (h2/h3/h4)
 * @param {Element} list the group's <ul>
 * @param {number} i index (for a stable id)
 */
function decorateGroup(heading, list, i) {
  const group = document.createElement('div');
  group.className = 'footer-group';
  heading.replaceWith(group);
  group.append(heading, list);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'footer-group-toggle';
  btn.innerHTML = heading.innerHTML;
  btn.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');
  const listId = `footer-group-${i}`;
  list.id = listId;
  btn.setAttribute('aria-controls', listId);
  heading.textContent = '';
  heading.append(btn);

  btn.addEventListener('click', () => {
    if (isDesktop.matches) return; // no collapsing on desktop
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
  });

  isDesktop.addEventListener('change', () => {
    btn.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment. When no explicit footer metadata is set, resolve
  // as a sibling of the current page (e.g. /content/en -> /content/footer) so it
  // resolves both in local preview (served under /content/) and in production.
  const footerMeta = getMetadata('footer');
  const siblingFooter = `${window.location.pathname.replace(/\/[^/]*$/, '')}/footer`;
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : siblingFooter;
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Label the top-level sections: brand/social, nav groups, legal.
  const sections = [...footer.children];
  if (sections[0]) sections[0].classList.add('footer-brand');
  if (sections[1]) sections[1].classList.add('footer-groups');
  if (sections[2]) sections[2].classList.add('footer-bottom');

  // Build + wire each nav group (heading + its following <ul>) as an accordion.
  const groupsWrap = sections[1];
  if (groupsWrap) {
    const headings = [...groupsWrap.querySelectorAll('h2, h3, h4')];
    headings.forEach((h, i) => {
      const list = h.nextElementSibling;
      if (list && list.tagName === 'UL') decorateGroup(h, list, i);
    });
  }

  decorateIcons(footer);
  block.append(footer);
}
