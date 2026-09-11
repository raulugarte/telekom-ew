/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: telekom.com site-wide cleanup.
 *
 * Removes non-authorable global chrome (header, footer, navigation),
 * the cookie/consent modal, the inline SVG icon sprite, and other
 * non-authorable leftovers so the import contains only the page-level
 * authorable content that lives inside <main>.
 *
 * All selectors verified against migration-work/cleaned.html:
 *  - #sprite-plyr                       (line 2)   inline SVG sprite (data-URI symbols)
 *  - .cmp-experiencefragment--header    (line 10)  header experience fragment wrapper
 *  - header, nav#primary-navigation     (line 15/29) global site header + nav
 *  - .cmp-experiencefragment--footer    (line 2105) footer experience fragment wrapper
 *  - footer                             (line 2108) global site footer
 *  - #__tealiumGDPRecModal              (line 2294) Tealium GDPR consent modal
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Consent modal + inline SVG sprite: remove before block parsing so
    // they never interfere with block matching. Verified in cleaned.html.
    // Also drop the news feed's footer controls (".teaser-group__footer":
    // a "Load more" button + a duplicate "Visit the newsroom" link) — the
    // newsroom link is already present in the feed header (".teaser-group__header").
    WebImporter.DOMUtils.remove(element, [
      '#__tealiumGDPRecModal',
      '#sprite-plyr',
      '.teaser-group__footer',
      '.teaser-group__load-more-wrapper',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome. The header/footer live in dedicated
    // experience-fragment wrappers that are siblings of <main>; remove the
    // whole wrapper (and the bare header/footer/nav as belt-and-suspenders).
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
      '.header-outer',
      '.footer-outer',
      'header',
      'footer',
      'nav',
    ]);

    // Attribute cleanup: strip Adobe data-layer / CMP tracking hooks and
    // inline handlers that are not authorable. Present on <body> and many
    // descendants in cleaned.html (data-cmp-data-layer-*, data-cmp-*).
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-data-layer-enabled');
      el.removeAttribute('data-cmp-data-layer-name');
    });
  }
}
