// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/*
 * Tabs Audience block — audience selector.
 *
 * Source (telekom.com) renders this as a single full-width rounded dropdown bar:
 * a collapsed trigger shows only the active audience ("Information for All", with
 * the trailing keyword in magenta) plus a chevron. Clicking expands a listbox of
 * the other audiences; selecting one updates the label and swaps the visible
 * teaser panel below.
 *
 * Authored structure: each row's first cell is the audience label, the rest is
 * that audience's panel content. We build a disclosure trigger + [role=listbox]
 * as the control, and keep the per-audience panels (show/hide) as the model.
 */

// Chevron icon matching the source (icon-collapse-down), white, ~48px.
const CHEVRON = `<svg class="tabs-audience-chevron" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/*
 * Render an audience label, highlighting the trailing keyword in magenta to
 * mirror the source ("Information for All" with "All" highlighted). If the label
 * does not match the "Information for X" pattern, render it plain (white).
 */
function labelMarkup(text) {
  const label = text.trim();
  const match = label.match(/^(Information for\s+)(.+)$/i);
  if (match) {
    return `${match[1]}<span class="tabs-audience-keyword">${match[2]}</span>`;
  }
  return label;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const audiences = rows.map((row) => {
    const label = row.firstElementChild ? row.firstElementChild.textContent.trim() : '';
    return { row, label, id: toClassName(label) };
  });

  // Build the disclosure control.
  const select = document.createElement('div');
  select.className = 'tabs-audience-select';

  const listId = 'tabs-audience-list';
  const trigger = document.createElement('button');
  trigger.className = 'tabs-audience-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', listId);
  trigger.setAttribute('aria-label', 'Select audience');

  const value = document.createElement('span');
  value.className = 'tabs-audience-value';
  trigger.append(value);
  trigger.insertAdjacentHTML('beforeend', CHEVRON);

  const list = document.createElement('ul');
  list.className = 'tabs-audience-list';
  list.id = listId;
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  select.append(trigger, list);

  const setLabel = (i) => {
    value.innerHTML = labelMarkup(audiences[i].label);
  };

  const showPanel = (i) => {
    audiences.forEach((a, idx) => {
      a.row.setAttribute('aria-hidden', idx !== i);
    });
  };

  const closeList = (focusTrigger = true) => {
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (focusTrigger) trigger.focus();
  };

  const openList = () => {
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    const current = list.querySelector('[aria-selected="true"]');
    if (current) current.focus();
  };

  const selectIndex = (i) => {
    setLabel(i);
    showPanel(i);
    list.querySelectorAll('[role="option"]').forEach((opt, idx) => {
      opt.setAttribute('aria-selected', idx === i);
    });
  };

  // Build options and decorate panels.
  audiences.forEach((audience, i) => {
    const { row, label, id } = audience;

    // Panel model (existing show/hide behaviour).
    row.className = 'tabs-audience-panel';
    row.id = `tabs-audience-panel-${id}`;
    row.setAttribute('role', 'region');
    row.setAttribute('aria-label', label);
    row.setAttribute('aria-hidden', i !== 0);
    // First cell was the label; it lives in the control now.
    if (row.firstElementChild) row.firstElementChild.remove();

    // Option.
    const option = document.createElement('li');
    option.className = 'tabs-audience-option';
    option.id = `tabs-audience-option-${id}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', i === 0);
    option.tabIndex = -1;
    option.innerHTML = labelMarkup(label);

    option.addEventListener('click', () => {
      selectIndex(i);
      closeList();
    });

    list.append(option);
  });

  const options = [...list.querySelectorAll('[role="option"]')];

  const focusOption = (i) => {
    const clamped = Math.max(0, Math.min(options.length - 1, i));
    options[clamped].focus();
  };

  trigger.addEventListener('click', () => {
    if (trigger.getAttribute('aria-expanded') === 'true') closeList();
    else openList();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openList();
    }
  });

  list.addEventListener('keydown', (e) => {
    const currentIndex = options.indexOf(document.activeElement);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusOption(currentIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusOption(currentIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusOption(0);
        break;
      case 'End':
        e.preventDefault();
        focusOption(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (currentIndex >= 0) {
          selectIndex(currentIndex);
          closeList();
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeList();
        break;
      default:
        break;
    }
  });

  // Close when focus/click leaves the control.
  document.addEventListener('click', (e) => {
    if (!select.contains(e.target) && trigger.getAttribute('aria-expanded') === 'true') {
      closeList(false);
    }
  });

  block.prepend(select);
  selectIndex(0);
}
