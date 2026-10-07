import type { Activity, Preferences, Routine } from './types';
import { atTime, fromKey, minutes, toTime } from './dates';
export function occursOn(a: Activity, date: string): boolean {
  if (a.enabled === false && !a.completedOn.includes(date)) return false;
  return a.days.length
    ? a.date <= date && a.days.includes(fromKey(date).getDay())
    : a.date === date;
}
export function activitiesForDate(
  activities: Activity[],
  date: string,
): Activity[] {
  return activities
    .filter((a) => occursOn(a, date))
    .sort((a, b) => a.time.localeCompare(b.time));
}
export function activityStatus(
  a: Activity,
  date: string,
  now: number,
): 'completed' | 'current' | 'upcoming' | 'missed' {
  if (a.completedOn.includes(date)) return 'completed';
  const start = atTime(date, a.time).getTime();
  if (now >= start + a.duration * 60000) return 'missed';
  return now >= start ? 'current' : 'upcoming';
}

export function nextActionableActivity(
  activities: Activity[],
  date: string,
  now: number,
) {
  const day = activitiesForDate(activities, date);
  return (
    day.find((a) => activityStatus(a, date, now) === 'current') ??
    day.find((a) => activityStatus(a, date, now) === 'upcoming') ??
    day.find((a) => activityStatus(a, date, now) === 'missed')
  );
}
export function findGap(
  activities: Activity[],
  date: string,
  duration: number,
  prefs: Preferences,
  now: Date,
): string | null {
  if (!prefs.workDays.includes(fromKey(date).getDay())) return null;
  let candidate = Math.max(
    minutes(prefs.workStart),
    date === localKey(now)
      ? Math.ceil((now.getHours() * 60 + now.getMinutes()) / 15) * 15
      : 0,
  );
  const end = minutes(prefs.workEnd);
  for (const a of activitiesForDate(activities, date)) {
    if (minutes(a.time) + a.duration <= candidate) continue;
    if (candidate + duration <= minutes(a.time)) return toTime(candidate);
    candidate = Math.max(candidate, minutes(a.time) + a.duration);
  }
  return candidate + duration <= end ? toTime(candidate) : null;
}
function localKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function hasConflict(activities: Activity[], a: Activity): boolean {
  const start = minutes(a.time),
    end = start + a.duration;
  return activitiesForDate(activities, a.date).some(
    (b) =>
      b.id !== a.id &&
      start < minutes(b.time) + b.duration &&
      end > minutes(b.time),
  );
}
export function routineActivities(r: Routine, date: string): Activity[] {
  return r.steps.map((s) => ({
    id: `routine-${r.id}-${s.id}`,
    title: s.title,
    notes: r.title,
    type: 'habit',
    category: s.category,
    date,
    time: s.time,
    duration: s.duration,
    days: r.days,
    completedOn: [],
    reminder: true,
    leadMinutes: 0,
    routineId: r.id,
    enabled: r.enabled,
  }));
}
