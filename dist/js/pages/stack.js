import { h, reveal } from '../lib/dom.js';
import { icon, brandColor } from '../lib/icon.js';
import { stack } from '../data/stack.js';

function createChip([name, iconName], index) {
  return h('li', { class: 'chip glow', vars: { '--brand': brandColor(iconName), '--i': index }, 'data-name': name.toLowerCase() }, icon(iconName, 18), h('span', null, name));
}

function createGroup(group) {
  const grid = h('ul', { class: 'stack-grid' }, group.items.map(createChip));

  const element = h(
    'section',
    { class: 'stack-group' },
    h('h2', { class: 'stack-group__title eyebrow' }, group.title, h('span', null, group.items.length)),
    grid,
  );

  return { element, chips: [...grid.children] };
}

export function mount(panel) {
  const total = stack.reduce((sum, group) => sum + group.items.length, 0);
  const groups = stack.map(createGroup);
  const empty = h('p', { class: 'empty', hidden: true }, 'nothing in the stack matches that.');

  const input = h('input', {
    type: 'search',
    placeholder: `filter ${total} technologies`,
    autocomplete: 'off',
    spellcheck: 'false',
    'aria-label': 'Filter the stack',
    id: 'stack-filter',
  });

  function filter() {
    const query = input.value.trim().toLowerCase();
    let visibleGroups = 0;

    for (const { element, chips } of groups) {
      let visible = 0;
      for (const chip of chips) {
        const match = !query || chip.dataset.name.includes(query);
        chip.hidden = !match;
        if (match) visible += 1;
      }
      element.hidden = visible === 0;
      if (visible) visibleGroups += 1;
    }

    empty.hidden = visibleGroups > 0;
  }

  input.addEventListener('input', filter);

  const intro = h('header', { class: 'page-title' }, h('h1', null, 'stack'), h('p', null, 'the languages, frameworks, tools and infrastructure i build with.'));
  const search = h('div', { class: 'stack-filter' }, icon('search', 16), input, h('kbd', null, '/'));

  panel.append(
    reveal(intro, 0),
    reveal(search, 1),
    h('div', { class: 'stack-groups' }, groups.map((group, index) => reveal(group.element, index + 2)), empty),
  );
}
