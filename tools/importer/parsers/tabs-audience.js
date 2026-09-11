/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-audience. Base: tabs.
 * Source: https://www.telekom.com/en (.personalisationselector .tabs.cmp-tabs)
 * Generated for DA project.
 *
 * Tabs convention: 2 columns, one row per tab.
 *   Row 1: block name (handled by createBlock).
 *   Each tab row: cell 1 = tab label (mandatory), cell 2 = panel content.
 * tabs-audience decorate uses the first cell of each row as the tab label and
 * the rest as the panel. Panels contain teaser/slider content; DM images and
 * anchors are preserved as-is (carrier anchors are produced by the transformer
 * downstream). Base64 SVG icons are dropped.
 */
export default function parse(element, { document }) {
  const panels = element.querySelectorAll('.tabs__panel.cmp-tabs__tabpanel, .cmp-tabs__tabpanel');

  // Tab labels: the mobile dropdown carries the full audience label
  // ("Information for All", etc.); the desktop tab buttons only carry the
  // static prefix. Prefer the dropdown option text.
  const dropdownLabels = Array.from(
    element.querySelectorAll('.dropdown__option .dropdown__option-text'),
  ).map((n) => n.textContent.replace(/\s+/g, ' ').trim());
  const tabButtons = Array.from(
    element.querySelectorAll('.tabs__list .tabs__tab, .cmp-tabs__tablist .cmp-tabs__tab'),
  );

  const cells = [];
  panels.forEach((panel, i) => {
    // Label cell.
    let labelText = dropdownLabels[i];
    if (!labelText && tabButtons[i]) {
      labelText = tabButtons[i].textContent.replace(/\s+/g, ' ').trim();
    }
    const labelCell = [];
    if (labelText) {
      const p = document.createElement('p');
      p.textContent = labelText;
      labelCell.push(p);
    }

    // Panel content cell: take the meaningful content wrapper, else the panel.
    const contentRoot = panel.querySelector('.cmp-container') || panel;
    // Clone so the source DOM the hook renders against stays intact.
    const panelClone = contentRoot.cloneNode(true);
    // Drop base64 SVG icon images (decorative noise).
    panelClone.querySelectorAll('img[src^="data:image/svg"]').forEach((img) => img.remove());
    // Drop screen-reader-only helper nodes.
    panelClone.querySelectorAll('.sr-only').forEach((n) => n.remove());

    // Skip empty tabs.
    if (!labelCell.length && !panelClone.textContent.trim()) return;

    cells.push([labelCell.length ? labelCell : '', panelClone]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-audience', cells });
  element.replaceWith(block);
}
