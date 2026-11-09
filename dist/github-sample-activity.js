// A decorative demonstration requested for the new account. These values are
// explicitly labelled as simulated in the UI and never replace GitHub API data.
export function sampleGitHubActivity(weekCount = 26, now = new Date()) {
  const dayMs = 86400000;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const weekday = (new Date(today).getUTCDay() + 6) % 7;
  const start = today - (weekday + (weekCount - 1) * 7) * dayMs;
  const weeks = [];
  let total = 0;
  let activeDays = 0;

  for (let week = 0; week < weekCount; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const timestamp = start + (week * 7 + day) * dayMs;
      const date = new Date(timestamp).toISOString().slice(0, 10);
      let seed = 2166136261;
      for (const character of `iTakeDev-demo-${date}`) {
        seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
      }
      const roll = seed % 100;
      const isFuture = timestamp > today;
      const level = isFuture || roll < 18 ? 0 : roll < 47 ? 1 : roll < 78 ? 2 : roll < 97 ? 3 : 4;
      const count = level === 0 ? 0 : level * 3 + ((seed >>> 8) % 6);
      total += count;
      if (count > 0) activeDays++;
      days.push({ date, timestamp, count, level, simulated: true });
    }
    weeks.push(days);
  }
  return { weeks, total, days: weekCount * 7, activeDays, simulated: true };
}
