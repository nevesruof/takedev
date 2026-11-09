import { h, reveal, externalLink } from '../lib/dom.js';
import { icon, brandColor } from '../lib/icon.js';
import { projects } from '../data/projects.js';

const STACK_LABELS = { typescript: 'TypeScript', python: 'Python' };
const LOGO_DIR = new URL('../../assets/projects/', import.meta.url);

function logo(project) {
  if (!project.logo) return h('span', { class: 'project__icon project__icon--letter' }, project.name[0]);

  const tone = project.logoTone ? ` project__icon--${project.logoTone}` : '';
  const image = h('img', { src: new URL(`${project.logo}.webp`, LOGO_DIR), alt: '', width: 30, height: 30, loading: 'lazy', decoding: 'async' });
  return h('span', { class: `project__icon${tone}` }, image);
}

function fact(label, ...value) {
  return h('div', { class: 'fact' }, h('span', { class: 'fact__label' }, label), h('div', { class: 'fact__value' }, value));
}

function stackChip(name) {
  return h('span', { class: 'chip chip--small', vars: { '--brand': brandColor(name) } }, icon(name, 14), STACK_LABELS[name] ?? name);
}

function details(project) {
  return [
    fact('role', project.role),
    fact('stack', project.stack.map(stackChip)),
    fact('stats', project.stats.map((stat) => h('span', { class: 'tag' }, stat))),
    fact('link', externalLink(project.href, null, new URL(project.href).hostname, h('span', { class: 'link-arrow' }, icon('external', 12)))),
  ];
}

function expandableRow(project) {
  const body = h('div', { class: 'project__body' }, h('div', { class: 'project__inner' }, details(project)));

  const head = h(
    'button',
    {
      class: 'project__head',
      type: 'button',
      'aria-expanded': 'false',
      on: { click: () => head.setAttribute('aria-expanded', String(head.getAttribute('aria-expanded') !== 'true')) },
    },
    logo(project),
    h('span', { class: 'project__name' }, project.name),
    h('span', { class: 'project__year' }, project.year),
    h('span', { class: 'project__chevron' }, icon('chevron', 14)),
    h('span', { class: 'project__blurb' }, project.blurb),
  );

  return h('li', { class: 'project' }, head, body);
}

function linkRow(project) {
  const head = externalLink(
    project.href,
    { class: 'project__head' },
    logo(project),
    h('span', { class: 'project__name' }, project.name),
    h('span', { class: 'project__year' }, project.year),
    h('span', { class: 'project__chevron link-arrow' }, icon('external', 12)),
    h('span', { class: 'project__blurb' }, project.blurb),
  );

  return h('li', { class: 'project' }, head);
}

export function mount(panel) {
  const intro = reveal(
    h(
      'header',
      { class: 'page-title' },
      h('h1', null, 'projects'),
      h('p', null, 'things i built, ran and worked on.'),
      h('p', { class: 'notice' }, h('span', { class: 'notice__dot' }), "i'm no longer part of new projects."),
    ),
    0,
  );

  const rows = projects.map((project, index) => reveal(project.role ? expandableRow(project) : linkRow(project), index + 1));
  panel.append(intro, h('ul', { class: 'projects' }, rows));
}
