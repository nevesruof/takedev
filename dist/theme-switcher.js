const STORAGE_KEY = 'take-theme';
const TOAST_MS = 2200;
const BIND_ATTEMPTS = 40;
const BIND_INTERVAL_MS = 250;

const MODES = [
  { id: 'auto', theme: 'dark', palette: 'cover', note: 'cover color' },
  { id: 'dark', theme: 'dark', palette: 'neutral', note: 'black' },
  { id: 'light', theme: 'light', palette: 'neutral', note: 'white' },
];

const root = document.documentElement;
let current = readMode();

function readMode() {
  try {
    return MODES.find((mode) => mode.id === localStorage.getItem(STORAGE_KEY)) ?? MODES[0];
  } catch {
    return MODES[0];
  }
}

function apply(mode) {
  current = mode;
  root.dataset.theme = mode.theme;
  root.dataset.palette = mode.palette;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode.theme === 'light' ? '#ffffff' : '#030405');

  try {
    localStorage.setItem(STORAGE_KEY, mode.id);
    localStorage.setItem('theme', mode.theme);
  } catch {}

  button.dataset.mode = mode.id;
  button.setAttribute('aria-label', `Change theme, current: ${mode.id}`);
}

function createButton() {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = 'theme-button';

  const swatch = document.createElement('span');
  swatch.className = 'theme-button__swatch';
  element.append(swatch);

  return element;
}

function createToast() {
  const element = document.createElement('div');
  element.className = 'theme-toast';
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  return element;
}

const button = createButton();
const toast = createToast();
let toastTimer = 0;

function showToast(mode) {
  toast.replaceChildren('theme', ...[mode.id, mode.note].flatMap((text) => [' · ', Object.assign(document.createElement('span'), { textContent: text })]));
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), TOAST_MS);
}

function change(next, origin) {
  const crossesTheme = next.theme !== current.theme;

  if (crossesTheme && document.startViewTransition) {
    root.style.setProperty('--theme-toggle-x', `${origin.x}px`);
    root.style.setProperty('--theme-toggle-y', `${origin.y}px`);
    root.dataset.themeTransition = next.theme === 'dark' ? 'to-dark' : 'to-light';
    document.startViewTransition(() => apply(next)).finished.finally(() => delete root.dataset.themeTransition);
  } else {
    apply(next);
  }

  showToast(next);
}

function cycle(origin) {
  const index = MODES.indexOf(current);
  change(MODES[(index + 1) % MODES.length], origin);
}

function followCoverColor() {
  const source = document.querySelector('[style*="--accent"]');
  if (!source) return false;

  const sync = () => {
    const accent = source.style.getPropertyValue('--accent').trim();
    const strong = source.style.getPropertyValue('--accent-strong').trim();
    if (accent) root.style.setProperty('--cover', accent);
    if (strong) button.style.setProperty('--swatch', strong);
  };

  new MutationObserver(sync).observe(source, { attributes: true, attributeFilter: ['style'] });
  sync();
  return true;
}

function waitForCoverColor() {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (followCoverColor() || attempts >= BIND_ATTEMPTS) clearInterval(timer);
  }, BIND_INTERVAL_MS);
}

function isTyping(target) {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
}

button.addEventListener('click', (event) => cycle({ x: event.clientX, y: event.clientY }));

document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() !== 't' || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
  const rect = button.getBoundingClientRect();
  cycle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
});

document.body.append(button, toast);
apply(current);
waitForCoverColor();
