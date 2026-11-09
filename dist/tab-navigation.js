import { Fb as toESM, Kb as requireReact } from './_bun/i4hv75y0pok2g.olqfze.x.js';

const React = toESM(requireReact(), 1);

// One persistent highlight spans both rows. Moving it with CSS avoids relying
// on shared-layout projection between separately mounted Motion elements.
export function createTabIndicator(nav, indicator) {
  let frame = 0;
  let disposed = false;
  const update = () => {
    if (disposed) return;
    const selected = nav.querySelector('[role="radio"][aria-checked="true"]');
    if (!selected) return;
    const parent = nav.getBoundingClientRect();
    const target = selected.getBoundingClientRect();
    indicator.style.width = `${target.width}px`;
    indicator.style.height = `${target.height}px`;
    indicator.style.transform = `translate3d(${target.left - parent.left}px, ${target.top - parent.top}px, 0)`;
    indicator.style.opacity = '1';
    if (!indicator.hasAttribute('data-ready')) {
      cancelAnimationFrame(frame);
      // Paint the initial position before enabling subsequent transitions.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => indicator.setAttribute('data-ready', ''));
      });
    }
  };
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
  resize?.observe(nav);
  nav.querySelectorAll('[role="radio"]').forEach(button => resize?.observe(button));
  window.addEventListener('resize', update);
  document.fonts?.ready.then(update);
  update();
  return {
    update,
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize?.disconnect();
      window.removeEventListener('resize', update);
    },
  };
}

export function useSlidingTabIndicator(active) {
  const navRef = React.useRef(null);
  const indicatorRef = React.useRef(null);
  const controller = React.useRef(null);
  React.useLayoutEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;
    const current = createTabIndicator(navRef.current, indicatorRef.current);
    controller.current = current;
    return () => {
      current.destroy();
      controller.current = null;
    };
  }, []);
  React.useLayoutEffect(() => controller.current?.update(), [active]);
  return { navRef, indicatorRef };
}
