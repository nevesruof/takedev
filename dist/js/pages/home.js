import { h, reveal, externalLink } from '../lib/dom.js';
import { icon } from '../lib/icon.js';
import { readClock, timeAgo } from '../lib/format.js';
import { watchPresence } from '../services/presence.js';
import { getCurrent, getRecent } from '../services/statsfm.js';

const STATUS_LABELS = { online: 'online', idle: 'idle', dnd: 'do not disturb', offline: 'offline' };

function createAvatar(initial) {
  const face = h('div', { class: 'avatar__face' }, initial);
  const dot = h('span', { class: 'status-dot', 'data-status': 'offline', hidden: true });
  const element = h('div', { class: 'avatar' }, face, dot);

  return {
    element,
    update({ avatar, decoration, status, available }) {
      if (avatar) face.replaceChildren(h('img', { src: avatar, alt: '', width: 128, height: 128, decoding: 'async' }));
      element.querySelector('.avatar__decoration')?.remove();
      if (decoration) element.prepend(h('img', { class: 'avatar__decoration', src: decoration, alt: '', decoding: 'async' }));
      dot.hidden = !available;
      dot.dataset.status = status ?? 'offline';
    },
  };
}

function createClock(timezone) {
  const time = h('div', { class: 'stat-card__value' });
  const offset = h('div', { class: 'stat-card__sub' });

  function tick() {
    const now = readClock(timezone);
    time.replaceChildren(`${now.hour}:${now.minute}`, h('span', { class: 'dim' }, `:${now.second}`), ' ', h('small', null, now.period));
    offset.textContent = now.offset;
  }

  tick();
  const card = h(
    'div',
    { class: 'card stat-card glow' },
    h('div', { class: 'stat-card__label' }, icon('clock', 12), 'local time'),
    time,
    offset,
  );

  return { card, tick };
}

function createDiscordCard() {
  const dot = h('span', { class: 'status-dot', 'data-status': 'offline' });
  const status = h('div', { class: 'stat-card__value' }, '…');
  const sub = h('div', { class: 'stat-card__sub' }, ' ');

  const card = h(
    'div',
    { class: 'card stat-card glow' },
    h('div', { class: 'stat-card__label' }, icon('discord', 12), 'discord'),
    status,
    sub,
  );

  return {
    card,
    update(presence) {
      if (!presence.loaded) return;

      if (!presence.available) {
        status.replaceChildren('—');
        sub.textContent = 'status unavailable';
        return;
      }

      dot.dataset.status = presence.status;
      status.replaceChildren(dot, ' ', STATUS_LABELS[presence.status] ?? presence.status);
      sub.textContent = presence.activity ?? (presence.platforms.length ? `on ${presence.platforms.join(' + ')}` : 'nothing going on');
    },
  };
}

function createListenCard(navigate) {
  let cover = h('div', { class: 'listen__cover skeleton' });
  const label = h('div', { class: 'stat-card__label' }, icon('music', 12), 'last played');
  const title = h('div', { class: 'listen__title' }, ' ');
  const artist = h('div', { class: 'listen__artist' }, ' ');

  const arrow = icon('external', 14);
  arrow.classList.add('link-arrow');

  const card = h('a', { class: 'card listen now__wide glow', href: '?tab=music' }, cover, h('div', { class: 'listen__text' }, label, title, artist), arrow);

  card.addEventListener('click', (event) => {
    event.preventDefault();
    navigate('music');
  });

  return {
    card,
    show(track, { playing }) {
      if (!track) {
        title.textContent = 'nothing yet';
        artist.textContent = '';
        return;
      }

      const next = track.image
        ? h('img', { class: 'listen__cover', src: track.image, alt: '', width: 52, height: 52, decoding: 'async' })
        : h('div', { class: 'listen__cover' });
      cover.replaceWith(next);
      cover = next;
      title.textContent = track.name;
      artist.textContent = playing ? track.subtitle : `${track.subtitle} · ${timeAgo(track.endedAt)}`;
      label.replaceChildren(
        playing ? h('span', { class: 'equalizer', 'aria-hidden': 'true' }, h('span'), h('span'), h('span')) : icon('music', 12),
        playing ? 'now playing' : 'last played',
      );
    },
  };
}

function createProjectCard({ name, blurb, label, href }) {
  return externalLink(
    href,
    { class: 'card project-card now__wide glow shine' },
    h(
      'div',
      { class: 'project-card__text' },
      h('div', { class: 'stat-card__label' }, h('span', { class: 'pulse' }), 'current project'),
      h('div', { class: 'project-card__title' }, name),
      h('div', { class: 'project-card__blurb' }, `${blurb} · ${label}`),
    ),
    h('span', { class: 'link-arrow' }, icon('external', 16)),
  );
}

export function mount(panel, { config, navigate }) {
  const avatar = createAvatar(config.initial);
  const clock = createClock(config.timezone);
  const discord = createDiscordCard();
  const listen = createListenCard(navigate);
  const abort = new AbortController();

  const header = h(
    'div',
    { class: 'profile__header' },
    avatar.element,
    h('h1', { class: 'profile__name' }, config.name, ' ', h('span', null, `(@${config.username})`)),
  );

  const links = h(
    'div',
    { class: 'profile__links' },
    config.links.map((link) => externalLink(link.href, { class: 'chip chip--small glow' }, icon(link.icon, 15), link.label)),
  );

  const profile = h(
    'section',
    { class: 'profile' },
    reveal(header, 0),
    reveal(h('p', { class: 'profile__bio' }, config.bio), 1),
    reveal(links, 2),
  );

  const now = h(
    'section',
    { class: 'now' },
    reveal(h('h2', { class: 'eyebrow' }, 'now'), 3),
    h(
      'div',
      { class: 'now__grid' },
      reveal(clock.card, 4),
      reveal(discord.card, 5),
      reveal(listen.card, 6),
      reveal(createProjectCard(config.currentProject), 7),
    ),
    reveal(h('p', { class: 'hint' }, 'press ? for keyboard shortcuts'), 8),
  );

  panel.classList.add('panel--center');
  panel.append(profile, now);

  const stopPresence = watchPresence((presence) => {
    discord.update(presence);
    avatar.update(presence);
  });
  const clockTimer = setInterval(clock.tick, 1000);

  Promise.all([getCurrent(abort.signal), getRecent(abort.signal)])
    .then(([current, recent]) => listen.show(current ?? recent, { playing: Boolean(current) }))
    .catch(() => listen.show(null, { playing: false }));

  return () => {
    abort.abort();
    clearInterval(clockTimer);
    stopPresence();
  };
}
