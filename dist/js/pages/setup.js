import { h, reveal, externalLink } from '../lib/dom.js';
import { icon, brandColor } from '../lib/icon.js';
import { machines, desk, software, tools } from '../data/setup.js';

function spec({ label, icon: iconName, value }) {
  return h('div', { class: 'spec' }, h('span', { class: 'spec__label' }, icon(iconName, 12), label), h('span', { class: 'spec__value' }, value));
}

function machineCard(machine) {
  const header = h(
    'div',
    { class: 'machine__header' },
    h('span', { class: 'machine__logo' }, icon(machine.icon, 20)),
    h('div', { class: 'machine__title' }, h('h3', null, machine.name), h('p', null, machine.tagline)),
    h('span', { class: 'machine__badge' }, machine.badge, machine.href && icon('external', 11)),
  );

  const body = [header, h('div', { class: 'specs' }, machine.specs.map(spec))];
  const card = machine.href
    ? externalLink(machine.href, { class: 'card machine__card glow' }, body)
    : h('div', { class: 'card machine__card glow' }, body);

  return h('section', { class: 'machine' }, h('h2', { class: 'eyebrow' }, machine.slot), card);
}

function gearItem(item) {
  return h(
    'div',
    { class: 'card gear__item glow' },
    h('div', { class: 'gear__top' }, icon(item.icon, 16), item.brand),
    h('div', null, h('div', { class: 'gear__name' }, item.name), h('div', { class: 'gear__detail' }, item.detail)),
  );
}

function appItem(item) {
  return h(
    'div',
    { class: 'app', vars: { '--brand': brandColor(item.icon) } },
    h('span', { class: 'app__icon' }, icon(item.icon, 20)),
    h('span', { class: 'app__name' }, item.name),
    h('span', { class: 'app__role' }, item.role),
  );
}

function toolChip(tool) {
  return h(
    'span',
    { class: 'chip chip--small glow', vars: { '--brand': brandColor(tool.icon) } },
    icon(tool.icon, 14),
    tool.name,
    h('span', { class: 'tool-version' }, tool.version),
  );
}

function section(title, content) {
  return h('section', { class: 'section' }, h('h2', { class: 'eyebrow' }, title), content);
}

export function mount(panel) {
  const blocks = [
    ...machines.map(machineCard),
    section('desk', h('div', { class: 'gear' }, desk.map(gearItem))),
    section('software', h('div', { class: 'software' }, software.map(appItem))),
    h('div', { class: 'tools' }, tools.map(toolChip)),
  ];

  panel.append(...blocks.map(reveal));
}
