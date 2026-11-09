import { h } from './lib/dom.js';
import { icon } from './lib/icon.js';

const TABS = [
  { id: 'main', label: 'Home', icon: 'home', row: 0, load: () => import('./pages/home.js') },
  { id: 'projects', label: 'Projects', icon: 'folder', row: 0, load: () => import('./pages/projects.js') },
  { id: 'music', label: 'Music', icon: 'music', row: 1, load: () => import('./pages/music.js') },
  { id: 'stack', label: 'Stack', icon: 'layers', row: 1, load: () => import('./pages/stack.js') },
  { id: 'setup', label: 'Setup', icon: 'setup', row: 1, load: () => import('./pages/setup.js') },
];

const LEGACY_TABS = { github: 'stack' };
const SLIDE_OFFSET = 26;

function tabFromUrl() {
  const requested = new URLSearchParams(location.search).get('tab');
  const id = LEGACY_TABS[requested] ?? requested;
  return TABS.some((tab) => tab.id === id) ? id : TABS[0].id;
}

function urlFor(id) {
  return id === TABS[0].id ? location.pathname : `${location.pathname}?tab=${id}`;
}

export function createRouter({ nav, stage, context }) {
  const indicator = h('span', { class: 'nav__indicator', 'aria-hidden': 'true' });
  const links = new Map();
  let current = null;
  let dispose = null;
  let navigation = 0;

  function buildNav() {
    const rows = [0, 1].map((row) => {
      const element = h('div', { class: 'nav__row' });
      TABS.filter((tab) => tab.row === row).forEach((tab) => {
        const link = h(
          'a',
          { class: 'nav__link', href: urlFor(tab.id), on: { click: (event) => { event.preventDefault(); go(tab.id); } } },
          icon(tab.icon, 14),
          tab.label,
        );
        links.set(tab.id, link);
        element.append(link);
      });
      return element;
    });

    nav.append(...rows, indicator);
  }

  function moveIndicator() {
    const active = links.get(current);
    if (!active) return;

    const origin = nav.getBoundingClientRect();
    const target = active.getBoundingClientRect();

    indicator.style.width = `${target.width}px`;
    indicator.style.height = `${target.height}px`;
    indicator.style.transform = `translate3d(${target.left - origin.left}px, ${target.top - origin.top}px, 0)`;
    indicator.style.opacity = '1';

    if (!indicator.hasAttribute('data-ready')) {
      requestAnimationFrame(() => requestAnimationFrame(() => indicator.setAttribute('data-ready', '')));
    }
  }

  function markActive() {
    links.forEach((link, id) => (id === current ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current')));
    moveIndicator();
  }

  async function show(id) {
    const tab = TABS.find((item) => item.id === id);
    const direction = current === null ? 1 : Math.sign(TABS.indexOf(tab) - TABS.findIndex((item) => item.id === current)) || 1;
    const ticket = ++navigation;

    current = id;
    markActive();
    document.title = id === 'main' ? context.config.name : `${tab.label.toLowerCase()} — ${context.config.name}`;

    dispose?.();
    dispose = null;

    const page = await tab.load();
    if (ticket !== navigation) return;

    const panel = h('div', { class: 'panel', role: 'region', 'aria-label': tab.label, vars: { '--tab-offset': `${direction * SLIDE_OFFSET}px` } });
    stage.replaceChildren(panel);
    dispose = page.mount(panel, context) ?? null;
    window.scrollTo({ top: 0 });
  }

  function go(id) {
    if (id === current) return;
    history.pushState(null, '', urlFor(id));
    show(id);
  }

  function step(delta) {
    const index = TABS.findIndex((tab) => tab.id === current);
    go(TABS[(index + delta + TABS.length) % TABS.length].id);
  }

  buildNav();
  context.navigate = go;

  window.addEventListener('popstate', () => show(tabFromUrl()));
  window.addEventListener('resize', moveIndicator);
  new ResizeObserver(moveIndicator).observe(nav);
  document.fonts?.ready.then(moveIndicator);

  show(tabFromUrl());

  return { go, step, tabs: TABS };
}
