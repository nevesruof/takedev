import { config } from './config.js';
import { createRouter } from './router.js';
import { initPointerEffects, pauseWhenHidden } from './lib/effects.js';

const nav = document.getElementById('nav');
const stage = document.getElementById('stage');
const help = document.getElementById('help');

const context = { config, navigate: () => {} };
const router = createRouter({ nav, stage, context });

initPointerEffects();
pauseWhenHidden();

document.getElementById('help-button').addEventListener('click', () => help.showModal());

help.addEventListener('click', (event) => {
  if (event.target === help) help.close();
});

function isTyping(target) {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
}

document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (isTyping(event.target)) {
    if (event.key === 'Escape') event.target.blur();
    return;
  }

  if (help.open) return;

  const number = Number(event.key);
  if (number >= 1 && number <= router.tabs.length) return router.go(router.tabs[number - 1].id);

  if (event.key === 'ArrowRight') router.step(1);
  else if (event.key === 'ArrowLeft') router.step(-1);
  else if (event.key === '?') help.showModal();
  else if (event.key === '/') {
    event.preventDefault();
    router.go('stack');
    requestAnimationFrame(() => document.getElementById('stack-filter')?.focus());
  }
});
