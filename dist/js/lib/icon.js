import { iconSet } from '../icons.js';

const templates = new Map();

function templateFor(name) {
  if (templates.has(name)) return templates.get(name);

  const def = iconSet[name];
  if (!def) return null;

  const paint = def.fill
    ? 'fill="currentColor"'
    : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

  const template = document.createElement('template');
  template.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${def.box} ${def.box}" ${paint} aria-hidden="true" focusable="false">${def.body}</svg>`;
  templates.set(name, template);
  return template;
}

export function icon(name, size = 16) {
  const template = templateFor(name);
  if (!template) return document.createTextNode('');

  const svg = template.content.firstElementChild.cloneNode(true);
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  return svg;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function brandColor(name) {
  const hex = iconSet[name]?.color;
  return hex && luminance(hex) >= 0.15 ? hex : '#ffffff';
}
