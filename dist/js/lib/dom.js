export function h(tag, props, ...children) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;

    if (key === 'class') node.className = value;
    else if (key === 'vars') for (const [name, v] of Object.entries(value)) node.style.setProperty(name, v);
    else if (key === 'on') for (const [type, handler] of Object.entries(value)) node.addEventListener(type, handler);
    else node.setAttribute(key, value === true ? '' : value);
  }

  append(node, children);
  return node;
}

export function append(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function reveal(node, index) {
  node.dataset.reveal = '';
  node.style.setProperty('--i', index);
  return node;
}

export function externalLink(href, props, ...children) {
  return h('a', { ...props, href, target: '_blank', rel: 'noopener noreferrer' }, ...children);
}
