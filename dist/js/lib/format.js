export function timeAgo(timestamp, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return 'just now';

  const units = [
    ['y', 31_536_000],
    ['mo', 2_592_000],
    ['d', 86_400],
    ['h', 3_600],
    ['m', 60],
  ];

  const [label, size] = units.find(([, size]) => seconds >= size);
  return `${Math.floor(seconds / size)}${label} ago`;
}

export function formatListened(ms) {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60).toLocaleString('en-US')}h`;
}

export function formatCount(value) {
  return Number(value ?? 0).toLocaleString('en-US');
}

export function readClock(timezone, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'shortOffset',
  }).formatToParts(date);

  const pick = (type) => parts.find((part) => part.type === type)?.value ?? '';

  return {
    hour: pick('hour'),
    minute: pick('minute'),
    second: pick('second'),
    period: pick('dayPeriod').toLowerCase(),
    offset: pick('timeZoneName').replace('GMT', 'UTC').replace('-', '−') || 'UTC',
  };
}
