import { h } from './dom.js';

export function segmented({ label, options, value, onChange }) {
  const thumb = h('span', { class: 'segmented__thumb' });
  let current = value;

  const buttons = options.map((option) =>
    h(
      'button',
      {
        class: 'segmented__option',
        type: 'button',
        'aria-pressed': String(option.value === current),
        on: { click: () => select(option.value) },
      },
      option.label,
    ),
  );

  const element = h('div', { class: 'segmented', role: 'group', 'aria-label': label }, thumb, buttons);

  function place() {
    const active = buttons[options.findIndex((option) => option.value === current)];
    if (!active || !active.offsetWidth) return;

    thumb.style.width = `${active.offsetWidth}px`;
    thumb.style.transform = `translateX(${active.offsetLeft}px)`;

    if (!thumb.hasAttribute('data-ready')) {
      requestAnimationFrame(() => requestAnimationFrame(() => thumb.setAttribute('data-ready', '')));
    }
  }

  function select(next) {
    if (next === current) return;
    current = next;
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(options[index].value === current)));
    place();
    onChange(next);
  }

  new ResizeObserver(place).observe(element);
  document.fonts?.ready.then(place);

  return element;
}
