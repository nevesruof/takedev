import { config } from '../config.js';

const API = 'https://beta-api.stats.fm/api/v1';
const SITE = 'https://stats.fm';
const TIMEOUT_MS = 6_000;
const CACHE_MS = 5 * 60_000;

const SNAPSHOTS = {
  '/streams/recent': 'music-recent',
  '/streams/stats': 'music-stats',
  '/top/tracks': 'music-tracks',
  '/top/albums': 'music-albums',
  '/top/artists': 'music-artists',
  '/top/genres': 'music-genres',
};

export const RANGES = [
  { value: 'weeks', label: '4 weeks' },
  { value: 'months', label: '6 months' },
  { value: 'lifetime', label: 'lifetime' },
];

const cache = new Map();

async function readJson(url, signal) {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`request failed: ${response.status}`);
  return response.json();
}

async function request(path, params = {}, outerSignal) {
  const query = new URLSearchParams(params).toString();
  const key = `${path}?${query}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), TIMEOUT_MS);
  outerSignal?.addEventListener('abort', () => timeout.abort(), { once: true });

  try {
    const body = await readJson(`${API}/users/${config.statsfm.user}${path}${query ? `?${query}` : ''}`, timeout.signal);
    const value = { body, live: true };
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (error) {
    if (outerSignal?.aborted || !SNAPSHOTS[path]) throw error;
    const snapshot = new URL(`../../data/${SNAPSHOTS[path]}.json`, import.meta.url);
    return { body: await readJson(snapshot, outerSignal), live: false };
  } finally {
    clearTimeout(timer);
  }
}

function firstId(ids, key) {
  return ids?.[key]?.find((id) => id.length > 0) ?? null;
}

function link(kind, item) {
  const spotify = firstId(item.externalIds, 'spotify');
  if (spotify) return `https://open.spotify.com/${kind}/${spotify}`;
  return `${SITE}/${kind === 'track' ? 'track' : kind}/${item.id}`;
}

function toTrack(track) {
  return {
    name: track.name,
    url: link('track', track),
    image: track.albums?.[0]?.image ?? null,
    subtitle: (track.artists ?? []).map((artist) => artist.name).join(', ') || 'Unknown artist',
  };
}

function toAlbum(album) {
  return {
    name: album.name,
    url: link('album', album),
    image: album.image ?? null,
    subtitle: (album.artists ?? []).map((artist) => artist.name).join(', '),
  };
}

function toArtist(artist) {
  return {
    name: artist.name,
    url: link('artist', artist),
    image: artist.image ?? null,
    subtitle: (artist.genres ?? []).slice(0, 2).join(', '),
    round: true,
  };
}

const MAPPERS = {
  tracks: (entry) => toTrack(entry.track),
  albums: (entry) => toAlbum(entry.album),
  artists: (entry) => toArtist(entry.artist),
};

export async function getRecent(signal) {
  const { body } = await request('/streams/recent', { limit: 1 }, signal);
  const latest = body.items?.[0];
  return latest ? { ...toTrack(latest.track), endedAt: Date.parse(latest.endTime) } : null;
}

export async function getCurrent(signal) {
  try {
    const { body } = await request('/streams/current', {}, signal);
    return body.item?.isPlaying ? toTrack(body.item.track) : null;
  } catch {
    return null;
  }
}

export async function getStats(range, signal) {
  const { body, live } = await request('/streams/stats', { range }, signal);
  const { count, durationMs, cardinality } = body.items;
  return { live, streams: count, durationMs, tracks: cardinality?.tracks ?? 0, artists: cardinality?.artists ?? 0 };
}

export async function getTop(kind, range, signal) {
  const { body, live } = await request(`/top/${kind}`, { range }, signal);
  return { live, items: body.items.slice(0, 10).map(MAPPERS[kind]) };
}

export async function getGenres(range, signal) {
  const { body, live } = await request('/top/genres', { range }, signal);
  return { live, items: body.items.slice(0, 12).map((entry) => entry.genre.tag) };
}

export const profileUrl = `${SITE}/user/${config.statsfm.user}`;
