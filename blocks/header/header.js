import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Closes every open megamenu panel in the nav.
 * @param {Element} nav
 */
function closeAllMenus(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((drop) => {
    drop.setAttribute('aria-expanded', 'false');
    const trigger = drop.querySelector(':scope > .nav-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
  nav.classList.remove('is-open');
}

/**
 * Opens a top-level nav section's megamenu panel, closing any others first.
 * Keeps the trigger's aria-expanded in sync.
 * @param {Element} navSection the <li>
 * @param {Element} nav
 */
function openMenu(navSection, nav) {
  closeAllMenus(nav);
  navSection.setAttribute('aria-expanded', 'true');
  const trigger = navSection.querySelector(':scope > .nav-trigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
  nav.classList.add('is-open');
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const open = nav.querySelector('.nav-drop[aria-expanded="true"]');
    if (open) {
      closeAllMenus(nav);
      const trigger = open.querySelector(':scope > a, :scope > p > a');
      if (trigger) trigger.focus();
    } else if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, false);
      const hb = nav.querySelector('.nav-hamburger button');
      if (hb) hb.focus();
    }
  }
}

/**
 * Toggles the whole nav open/closed (mobile drawer). Desktop keeps it visible.
 * @param {Element} nav
 * @param {Boolean} forceExpanded
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  if (expanded) closeAllMenus(nav);
}

/**
 * Prepends a mobile "back" control to a panel <ul>. Tapping it collapses the
 * owning <li> (slides the sub-panel back out). Hidden on desktop via CSS.
 * @param {Element} panel the panel <ul>
 * @param {Element} owner the <li> the panel belongs to
 * @param {string} label e.g. "Back to main menu" / "Back to About us"
 */
function addBackButton(panel, owner, label) {
  const li = document.createElement('li');
  li.className = 'nav-back';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-back-button';
  btn.textContent = label;
  btn.addEventListener('click', () => {
    owner.setAttribute('aria-expanded', 'false');
    const t = owner.querySelector(':scope > .nav-trigger, :scope > a');
    if (t && t.hasAttribute('aria-expanded')) t.setAttribute('aria-expanded', 'false');
  });
  li.append(btn);
  panel.prepend(li);
}

/**
 * Wires a top-level nav item that owns a megamenu panel.
 * Opens on hover (desktop) and toggles on click; the label still links.
 * @param {Element} navSection the <li>
 * @param {Element} nav
 */
function decorateDrop(navSection, nav, index) {
  navSection.classList.add('nav-drop');
  navSection.setAttribute('aria-expanded', 'false');
  // Unwrap the single-link <p> EDS emits so the trigger anchor is a direct
  // child of the <li> (cleaner markup + recognizable as a menu trigger).
  const triggerP = navSection.querySelector(':scope > p');
  if (triggerP && triggerP.querySelector('a')) {
    triggerP.replaceWith(...triggerP.childNodes);
  }
  const trigger = navSection.querySelector(':scope > a');
  const panel = navSection.querySelector(':scope > ul');

  // Mirror the source's trigger semantics: each top-level item announces a
  // popup and controls its panel. Tag the trigger so it is recognizable as a
  // menu trigger (a11y + parity with telekom.com's aria-haspopup nav items).
  if (trigger && panel) {
    const panelId = `nav-${index}`;
    panel.id = panelId;
    trigger.classList.add('nav-trigger');
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);
    // Mobile: a "Back to main menu" control at the top of the panel.
    addBackButton(panel, navSection, 'Back to main menu');
    // Desktop: a "Close Menu" control at the bottom-right of the panel (source).
    const closeLi = document.createElement('li');
    closeLi.className = 'nav-close';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'nav-close-button';
    closeBtn.textContent = 'Close Menu';
    closeBtn.addEventListener('click', () => closeAllMenus(nav));
    closeLi.append(closeBtn);
    panel.append(closeLi);
  }

  // Click: toggle this panel (and close siblings). The anchor keeps its href
  // for keyboard/Enter navigation, but a pointer click opens the panel first.
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      const isOpen = navSection.getAttribute('aria-expanded') === 'true';
      if (!isOpen) {
        // first click opens the panel instead of navigating
        e.preventDefault();
        openMenu(navSection, nav);
      }
      // second click (already open) follows the link
    });
  }

  // Progressive drill-in: parent items with their own <ul> toggle a child column.
  navSection.querySelectorAll(':scope ul li:has(> ul)').forEach((parent) => {
    parent.classList.add('nav-drop-parent');
    parent.setAttribute('aria-expanded', 'false');
    const childTrigger = parent.querySelector(':scope > a');
    const childPanel = parent.querySelector(':scope > ul');
    if (childTrigger) {
      childTrigger.addEventListener('click', (e) => {
        const isOpen = parent.getAttribute('aria-expanded') === 'true';
        if (!isOpen) {
          e.preventDefault();
          // close sibling child columns at the same level
          parent.parentElement.querySelectorAll(':scope > .nav-drop-parent[aria-expanded="true"]').forEach((sib) => {
            if (sib !== parent) sib.setAttribute('aria-expanded', 'false');
          });
          parent.setAttribute('aria-expanded', 'true');
        }
      });
    }
    // Mobile: a "Back to <section>" control at the top of the child panel,
    // labelled by the panel that CONTAINS this parent (e.g. the Corporate
    // Governance sub-panel returns to "About us").
    if (childPanel) {
      const ownerUl = parent.parentElement;
      const ancestorLi = ownerUl ? ownerUl.closest('li') : null;
      const ancestorTrigger = ancestorLi
        ? ancestorLi.querySelector(':scope > .nav-trigger, :scope > a') : null;
      const ancestorLabel = ancestorTrigger ? ancestorTrigger.textContent.trim() : 'menu';
      addBackButton(childPanel, parent, `Back to ${ancestorLabel}`);
    }
  });

  // Note: the megamenu opens on CLICK only (source behavior). Hover just
  // highlights the item (handled in CSS) — it does not unfold the panel.
}

/**
 * Wires the search entry point to an expandable search field, mirroring
 * telekom.com: clicking the icon opens a search region with an auto-focused
 * input + submit + close; clicking again / Close / Escape / outside closes it.
 * @param {Element} btn the search toggle button
 * @param {Element} nav the nav element
 */
function wireSearch(btn, nav) {
  const panel = document.createElement('div');
  panel.className = 'nav-search-panel';
  panel.id = 'nav-search-panel';
  panel.setAttribute('role', 'search');
  panel.hidden = true;
  panel.innerHTML = `
    <form class="nav-search-form" role="search" action="/en/general/search" method="get">
      <input class="nav-search-input" type="search" name="q" aria-label="Search" placeholder="Search">
      <button type="submit" class="nav-search-submit" aria-label="Search">
        <span class="icon icon-search"></span>
      </button>
      <button type="button" class="nav-search-close" aria-label="Close Search">
        <span class="nav-search-close-icon" aria-hidden="true"></span>
      </button>
    </form>`;
  nav.append(panel);
  const input = panel.querySelector('.nav-search-input');

  const setOpen = (open) => {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close search' : 'Search');
    nav.classList.toggle('search-open', open);
    if (open) input.focus();
  };

  btn.addEventListener('click', () => setOpen(panel.hidden));
  panel.querySelector('.nav-search-close').addEventListener('click', () => { setOpen(false); btn.focus(); });
  panel.addEventListener('keydown', (e) => { if (e.code === 'Escape') { setOpen(false); btn.focus(); } });
  // click-outside closes
  document.addEventListener('click', (e) => {
    if (panel.hidden) return;
    const inside = panel.contains(e.target) || btn.contains(e.target) || e.target === btn;
    if (!inside) setOpen(false);
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment. When no explicit nav metadata is set, resolve the
  // fragment as a sibling of the current page (e.g. /content/en -> /content/nav)
  // so the nav resolves both in local preview (served under /content/) and in
  // production (served at the content root).
  const navMeta = getMetadata('nav');
  const siblingNav = `${window.location.pathname.replace(/\/[^/]*$/, '')}/nav`;
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : siblingNav;
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      const container = brandLink.closest('.button-container');
      if (container) container.className = '';
    }
  }

  // Turn the ":search:" token (or a decorated .icon-search span) in the tools
  // area into an accessible search icon button.
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    // Unwrap the language-switch <p> so its link is a direct child of the tools
    // group (recognizable as a header control) and tag it.
    const langP = [...navTools.querySelectorAll('p')].find((p) => {
      const a = p.querySelector('a');
      return a && a.getAttribute('href') && a.getAttribute('href').replace(/\/$/, '').endsWith('/de');
    });
    if (langP) {
      const langLink = langP.querySelector('a');
      langLink.classList.add('nav-language');
      langP.replaceWith(langLink);
      // Source: on mobile the language switch lives at the bottom of the drawer,
      // not in the top bar. Relocate it between the tools row (desktop) and the
      // nav-sections drawer (mobile) as the breakpoint changes.
      const placeLanguage = () => {
        const sectionsWrapper = nav.querySelector('.nav-sections .default-content-wrapper') || nav.querySelector('.nav-sections');
        if (isDesktop.matches) {
          // Source order: Deutsch first, then the search icon.
          if (langLink.parentElement !== navTools) navTools.prepend(langLink);
        } else if (sectionsWrapper && langLink.parentElement !== sectionsWrapper) {
          sectionsWrapper.append(langLink);
        }
      };
      placeLanguage();
      isDesktop.addEventListener('change', placeLanguage);
    }
    const searchP = [...navTools.querySelectorAll('p')]
      .find((p) => p.textContent.trim() === ':search:' || p.querySelector('.icon-search'));
    if (searchP) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-search';
      btn.setAttribute('aria-label', 'Search');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', 'nav-search-panel');
      btn.innerHTML = '<span class="icon icon-search"></span>';
      searchP.replaceWith(btn);
      wireSearch(btn, nav);
    }
  }
  decorateIcons(nav);

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const topUl = navSections.querySelector(':scope .default-content-wrapper > ul');
    if (topUl) topUl.classList.add('nav-list');
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection, i) => {
      if (navSection.querySelector('ul')) decorateDrop(navSection, nav, i);
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // close menus when clicking outside the nav or pressing Escape
  window.addEventListener('keydown', closeOnEscape);
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllMenus(nav);
  });

  isDesktop.addEventListener('change', () => {
    document.body.style.overflowY = '';
    nav.setAttribute('aria-expanded', 'false');
    closeAllMenus(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
