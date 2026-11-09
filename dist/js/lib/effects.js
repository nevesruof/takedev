export function initPointerEffects() {
  const glow = document.getElementById('pointer-glow');
  let frame = 0;
  let pointer = { x: 0, y: 0, target: null };

  function paint() {
    frame = 0;
    glow.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;

    const spot = pointer.target?.closest('.glow');
    if (!spot) return;

    const rect = spot.getBoundingClientRect();
    spot.style.setProperty('--mx', `${pointer.x - rect.left}px`);
    spot.style.setProperty('--my', `${pointer.y - rect.top}px`);
  }

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      pointer = { x: event.clientX, y: event.clientY, target: event.target };
      glow.classList.add('is-active');
      if (!frame) frame = requestAnimationFrame(paint);
    },
    { passive: true },
  );

  document.documentElement.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
}

export function pauseWhenHidden() {
  const sync = () => document.documentElement.classList.toggle('is-hidden', document.hidden);
  document.addEventListener('visibilitychange', sync);
  sync();
}
