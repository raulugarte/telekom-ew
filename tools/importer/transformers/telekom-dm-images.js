/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: telekom.com Dynamic Media / Scene7 images.
 *
 * The source uses AEM Assets Delivery (DM Open API) image URLs, e.g.
 *   https://delivery-p167603-e1796511.adobeaemcloud.com/adobe/assets/urn:aaid:aem:.../as/image.webp?width=...&smartcrop=...
 * (11 such URLs in migration-work/metadata.json .images.mapping).
 *
 * Raw <img src="DM-URL"> would not survive the docx → markdown round-trip,
 * so this rewrites each DM <img> into an anchor that carries the DM URL:
 *  - unlinked img → <a href="DM-URL">alt</a>
 *  - linked img   → <a href="/page" title="DM-URL">alt</a> (nav href preserved)
 * A companion auto-block in scripts/scripts.js rebuilds these anchors into
 * responsive <picture> elements at render time.
 *
 * Runs in afterTransform ONLY: block parsers run between the hooks and
 * extract <img> references into block cells (cards/carousel). Rewriting imgs
 * to anchors earlier would leave those cells empty. See dm-scene7-transformer.md.
 */

// ---- Begin canonical helpers (copied byte-identical from dm-scene7-helpers.js) ----
function detectDynamicMediaUrl(urlStr) {
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch { return false; }
  // Scene7 detected by path alone — hostname is irrelevant because
  // customer sites routinely CNAME a vanity domain to Scene7 (e.g.
  // media-assets.brand.example). Keep byte-identical with dm-scene7-helpers.js.
  if (u.pathname.startsWith('/is/image/')) {
    return 'scene7';
  }
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

// Walk up from a DM <img> through allow-listed inline wrappers (currently
// just <picture>) to find the carrier anchor for the linked-image
// round-trip. Returns the outer <a> when the img is the sole meaningful
// descendant; null otherwise. Keep byte-identical with dm-scene7-helpers.js.
const LINKED_DM_INLINE_WRAPPER_TAGS = new Set(['PICTURE']);
const LINKED_DM_WRAPPER_SIBLING_TAGS = new Set(['SOURCE']); // standard <picture> siblings
function findLinkedDmCarrier(img) {
  if (!img || !img.parentElement) return null;
  let node = img;
  let parent = img.parentElement;
  while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
    let foundNode = false;
    for (const child of parent.children) {
      if (child === node) {
        foundNode = true;
      } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
        return null;
      }
    }
    if (!foundNode) return null;
    node = parent;
    parent = parent.parentElement;
  }
  if (!parent || parent.tagName !== 'A') return null;
  if (parent.children.length !== 1 || parent.children[0] !== node) return null;
  if (parent.textContent.trim() !== '') return null;
  return parent;
}

const EMPTY_ALT_SENTINEL = 'Image without alt text';

function altToLinkText(alt) {
  return alt || EMPTY_ALT_SENTINEL;
}
// ---- End canonical helpers ----

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const doc = element.ownerDocument;

  element.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!detectDynamicMediaUrl(src)) return;

    // Preserve alt verbatim; empty alt becomes the sentinel so authors see a
    // visible cell in Document view (auto-block maps it back to alt="").
    const alt = img.getAttribute('alt') || '';

    // Linked image (incl. parser-wrapped <a><picture><img></picture></a>).
    const linkedAnchor = findLinkedDmCarrier(img);
    if (linkedAnchor) {
      linkedAnchor.setAttribute('title', src);
      linkedAnchor.textContent = altToLinkText(alt);
      return;
    }

    // Inside an anchor but not a sole-meaningful-child shape — mixed content.
    const parent = img.parentElement;
    if (parent && parent.tagName === 'A') {
      // eslint-disable-next-line no-console
      console.warn('DM image inside mixed-content anchor, skipped:', src);
      return;
    }

    // Unlinked image: create an anchor whose href is the DM URL.
    const a = doc.createElement('a');
    a.href = src;
    a.textContent = altToLinkText(alt);
    img.replaceWith(a);
  });
}
