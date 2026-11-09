import { config } from '../config.js';

const ENDPOINT = 'https://api.lanyard.rest/v1/users/';
const REFRESH_MS = 30_000;
const TIMEOUT_MS = 6_000;
const CUSTOM_STATUS = 4;
const SPOTIFY_ID = 'spotify:1';

const ACTIVITY_VERBS = { 0: 'playing', 1: 'streaming', 2: 'listening to', 3: 'watching', 5: 'competing in' };

const listeners = new Set();
let state = { loaded: false, available: false };
let timer = 0;
let controller = null;

function avatarUrl(user) {
  if (!user?.avatar) return null;
  const extension = user.avatar.startsWith('a_') ? 'gif' : 'webp';
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=128`;
}

function decorationUrl(user) {
  const asset = user?.avatar_decoration_data?.asset;
  return asset ? `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=96&passthrough=true` : null;
}

function describeActivity(data) {
  const game = data.activities.find((activity) => activity.type !== CUSTOM_STATUS && activity.id !== SPOTIFY_ID);
  if (game) return `${ACTIVITY_VERBS[game.type] ?? 'playing'} ${game.name}`;
  if (data.listening_to_spotify && data.spotify) return `listening to ${data.spotify.song}`;
  return data.activities.find((activity) => activity.type === CUSTOM_STATUS)?.state ?? null;
}

function platforms(data) {
  return [
    data.active_on_discord_desktop && 'desktop',
    data.active_on_discord_mobile && 'mobile',
    data.active_on_discord_web && 'web',
  ].filter(Boolean);
}

function normalize(data) {
  return {
    loaded: true,
    available: true,
    status: data.discord_status ?? 'offline',
    activity: describeActivity(data),
    platforms: platforms(data),
    avatar: avatarUrl(data.discord_user),
    decoration: decorationUrl(data.discord_user),
    displayName: data.discord_user?.global_name ?? data.discord_user?.display_name ?? null,
  };
}

function publish(next) {
  state = next;
  listeners.forEach((listener) => listener(state));
}

async function refresh() {
  controller?.abort();
  controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${ENDPOINT}${config.discordId}`, { signal: controller.signal });
    const body = await response.json();
    publish(body.success ? normalize(body.data) : { loaded: true, available: false });
  } catch {
    if (!state.loaded) publish({ loaded: true, available: false });
  } finally {
    clearTimeout(timeout);
  }
}

function schedule() {
  timer = setTimeout(async () => {
    if (!document.hidden) await refresh();
    schedule();
  }, REFRESH_MS);
}

function start() {
  refresh();
  schedule();
}

function stop() {
  clearTimeout(timer);
  controller?.abort();
}

export function watchPresence(listener) {
  listeners.add(listener);
  listener(state);
  if (listeners.size === 1) start();

  return () => {
    listeners.delete(listener);
    if (!listeners.size) stop();
  };
}
