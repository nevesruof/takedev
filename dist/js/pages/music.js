import { h, reveal, externalLink } from '../lib/dom.js';
import { icon } from '../lib/icon.js';
import { segmented } from '../lib/segmented.js';
import { formatCount, formatListened, timeAgo } from '../lib/format.js';
import { RANGES, getCurrent, getGenres, getRecent, getStats, getTop, profileUrl } from '../services/statsfm.js';

const KINDS = [
  { value: 'albums', label: 'albums' },
  { value: 'artists', label: 'artists' },
  { value: 'tracks', label: 'tracks' },
];

function skeletonRows(count) {
  return Array.from({ length: count }, (_, index) =>
    h('div', { class: 'rank rank--skeleton', vars: { '--i': index } }, h('span'), h('div', { class: 'skeleton' }), h('div', { class: 'skeleton' })),
  );
}

function rankRow(item, index) {
  const cover = item.image
    ? h('img', { class: `rank__cover${item.round ? ' rank__cover--round' : ''}`, src: item.image, alt: '', width: 44, height: 44, loading: 'lazy', decoding: 'async' })
    : h('div', { class: `rank__cover${item.round ? ' rank__cover--round' : ''}` });

  return externalLink(
    item.url,
    { class: 'rank', vars: { '--i': index } },
    h('span', { class: 'rank__pos' }, index + 1),
    cover,
    h('div', { class: 'rank__text' }, h('span', { class: 'rank__title' }, item.name), h('span', { class: 'rank__sub' }, item.subtitle)),
  );
}

function nowPlaying(track, playing) {
  if (!track) return h('p', { class: 'empty' }, 'nothing played yet.');

  const cover = track.image
    ? h('img', { class: 'now-playing__cover', src: track.image, alt: '', width: 88, height: 88, decoding: 'async' })
    : h('div', { class: 'now-playing__cover' });

  const meta = playing
    ? h('div', { class: 'now-playing__meta is-live' }, h('span', { class: 'equalizer', 'aria-hidden': 'true' }, h('span'), h('span'), h('span')), 'now playing')
    : h('div', { class: 'now-playing__meta' }, timeAgo(track.endedAt));

  return h(
    'div',
    { class: 'now-playing' },
    cover,
    h('div', { class: 'now-playing__text' }, externalLink(track.url, { class: 'now-playing__title' }, track.name), h('span', { class: 'muted' }, track.subtitle), meta),
  );
}

function statsRow(stats) {
  const entries = [
    [formatCount(stats.streams), 'streams'],
    [formatListened(stats.durationMs), 'listened'],
    [formatCount(stats.tracks), 'tracks'],
    [formatCount(stats.artists), 'artists'],
  ];

  return entries.map(([value, label]) => h('div', null, h('strong', null, value), h('span', null, label)));
}

export function mount(panel, { config }) {
  const state = { range: 'weeks', kind: 'tracks' };
  let loadId = 0;
  const latest = new AbortController();
  let controller = new AbortController();

  const nowSlot = h('section', null, h('div', { class: 'skeleton', style: 'height:88px' }));
  const statsSlot = h('div', { class: 'listening-stats' });
  const listSlot = h('div', { class: 'ranking' });
  const genresSlot = h('div', { class: 'genres__list' });
  const noteSlot = h('p', { class: 'snapshot-note' });

  const rangeControl = segmented({ label: 'time range', options: RANGES, value: state.range, onChange: (value) => { state.range = value; loadRange(); } });
  const kindControl = segmented({ label: 'ranking type', options: KINDS, value: state.kind, onChange: (value) => { state.kind = value; loadList(); } });

  const controls = h(
    'div',
    { class: 'music-controls' },
    h('p', { class: 'music-user' }, externalLink(profileUrl, null, config.statsfm.name)),
    rangeControl,
  );

  const genres = h('section', { class: 'genres' }, h('h2', { class: 'eyebrow' }, 'genres'), genresSlot);

  panel.append(
    reveal(nowSlot, 0),
    reveal(statsSlot, 1),
    reveal(controls, 2),
    reveal(kindControl, 3),
    reveal(h('div', null, listSlot, noteSlot), 4),
    reveal(genres, 5),
  );

  function markSnapshot(live) {
    noteSlot.textContent = live ? '' : 'showing a saved snapshot — stats.fm could not be reached.';
  }

  async function loadList() {
    const id = ++loadId;
    listSlot.replaceChildren(...skeletonRows(4));

    try {
      const { items, live } = await getTop(state.kind, state.range, controller.signal);
      if (id !== loadId) return;
      listSlot.replaceChildren(...(items.length ? items.map(rankRow) : [h('p', { class: 'empty' }, `no ${state.kind} in this range yet.`)]));
      markSnapshot(live);
    } catch {
      if (id === loadId) listSlot.replaceChildren(h('p', { class: 'empty' }, `could not load ${state.kind}.`));
    }
  }

  async function loadRange() {
    controller.abort();
    controller = new AbortController();
    const { signal } = controller;

    statsSlot.replaceChildren(...[1, 2, 3, 4].map(() => h('div', { class: 'skeleton', style: 'width:84px;height:22px' })));
    genresSlot.replaceChildren();
    loadList();

    getStats(state.range, signal)
      .then((stats) => statsSlot.replaceChildren(...statsRow(stats)))
      .catch(() => statsSlot.replaceChildren());

    getGenres(state.range, signal)
      .then(({ items }) => genresSlot.replaceChildren(...(items.length ? items.map((name) => h('span', { class: 'tag' }, name)) : [h('p', { class: 'empty' }, 'no genres yet.')])))
      .catch(() => genresSlot.replaceChildren());
  }

  Promise.all([getCurrent(latest.signal), getRecent(latest.signal)])
    .then(([current, recent]) => nowSlot.replaceChildren(nowPlaying(current ?? recent, Boolean(current))))
    .catch(() => nowSlot.replaceChildren(h('p', { class: 'empty' }, 'could not load the latest track.')));

  loadRange();

  return () => {
    latest.abort();
    controller.abort();
  };
}
