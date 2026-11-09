import { Fb as toESM, Kb as requireReact, Mb as jsx } from './_bun/i4hv75y0pok2g.olqfze.x.js';

const React = toESM(requireReact(), 1);
const order = ['main', 'projects', 'music', 'github', 'setup'];

// Animate a normal-flow panel, avoiding cross-browser SVG filters and measured
// absolute-position containers. Content remains visible if animation is disabled.
export function TabStage({ active, children }) {
  const previous = React.useRef(active);
  const direction = React.useRef(1);
  if (previous.current !== active) {
    direction.current = Math.sign(order.indexOf(active) - order.indexOf(previous.current)) || 1;
    previous.current = active;
  }
  return jsx('div', {
    className: 'itake-tab-stage',
    children: jsx('div', {
      className: 'itake-tab-panel',
      style: { '--tab-offset': `${direction.current * 26}px` },
      children,
    }, active),
  });
}
