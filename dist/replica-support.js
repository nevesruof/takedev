// Keep the reference's public integrations usable if a provider is unavailable.
import { assets, snapshots } from './replica-data.js';

const originalFetch = globalThis.fetch.bind(globalThis);
export function assetUrl(url) {
  return url ? (assets[url] || url) : url;
}

function snapshotFor(input) {
  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  const key = url.origin + url.pathname.replace(/\/$/, '');
  return snapshots[key];
}

export async function fetchResource(input, options = {}) {
  const snapshot = snapshotFor(input);
  if (!snapshot) return originalFetch(input, options);
  const controller = new AbortController();
  const abort = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted) abort();
  else options.signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await originalFetch(input, { ...options, signal: controller.signal });
    if (response.ok) return response;
    throw new Error('Public data provider unavailable');
  } catch (error) {
    if (options.signal?.aborted) throw error;
    return originalFetch(snapshot, { signal: options.signal, cache: 'force-cache' });
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}
