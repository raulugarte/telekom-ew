/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: telekom.com section breaks + Section Metadata.
 *
 * The "home" template has 7 sections (page-templates.json). This inserts an
 * <hr> before each non-first section and a Section Metadata block (style)
 * after each styled section.
 *
 * Uses BOTH hooks: breaks are inserted in beforeTransform (while every
 * section element still exists, before block parsers replace them via
 * element.replaceWith(block)); metadata blocks are inserted in
 * afterTransform, anchored to a marker <hr> that survives parsing. Sections
 * are processed in reverse so inserts never disturb not-yet-processed
 * sections. See generate-import-transformer.md "Why both hooks".
 *
 * Section selectors verified against migration-work/cleaned.html:
 *  - .stagevideo                    (line 1110)
 *  - .personalisationselector       (line 1139)
 *  - .feed-outer                    (line 1614)
 *  - .facts-outer                   (line 1745)
 *  - .teasergroupslider.theme-orchid(line 1829 — distinct from .theme-macaw sliders)
 *  - .events-teaser                 (line 1998)
 *  - .claim-outer                   (line 2090)
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — try each, first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section) the original element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
