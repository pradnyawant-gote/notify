import type { AppState } from '../domain/types';
import { validDate, validTime } from '../domain/dates';
function record(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
function strings(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}
function days(v: unknown): v is number[] {
  return (
    Array.isArray(v) && v.every((x) => Number.isInteger(x) && x >= 0 && x <= 6)
  );
}
export function validState(v: unknown): v is AppState {
  if (
    !record(v) ||
    v.version !== 1 ||
    !record(v.preferences) ||
    !Array.isArray(v.activities) ||
    !Array.isArray(v.routines) ||
    !Array.isArray(v.sessions) ||
    !record(v.reviews)
  )
    return false;
  const p = v.preferences;
  if (
    typeof p.name !== 'string' ||
    !['work', 'study', 'flexible'].includes(String(p.schedule)) ||
    !['light', 'dark', 'system'].includes(String(p.theme)) ||
    !['gentle', 'balanced', 'proactive'].includes(String(p.intensity)) ||
    !strings(p.goals) ||
    !days(p.workDays)
  )
    return false;
  if (
    !['wake', 'sleep', 'workStart', 'workEnd'].every(
      (k) => typeof p[k] === 'string' && validTime(p[k] as string),
    )
  )
    return false;
  if (
    ![
      'onboarded',
      'demo',
      'notifications',
      'before',
      'start',
      'followUp',
      'missed',
      'breaks',
      'habits',
      'review',
    ].every((k) => typeof p[k] === 'boolean')
  )
    return false;
  const validActivity = (a: unknown) =>
    record(a) &&
    typeof a.id === 'string' &&
    typeof a.title === 'string' &&
    typeof a.notes === 'string' &&
    ['task', 'reminder', 'habit', 'meeting', 'focus', 'personal'].includes(
      String(a.type),
    ) &&
    ['work', 'study', 'health', 'personal', 'rest'].includes(
      String(a.category),
    ) &&
    typeof a.date === 'string' &&
    validDate(a.date) &&
    typeof a.time === 'string' &&
    validTime(a.time) &&
    typeof a.duration === 'number' &&
    a.duration > 0 &&
    a.duration <= 720 &&
    days(a.days) &&
    strings(a.completedOn) &&
    typeof a.reminder === 'boolean' &&
    typeof a.leadMinutes === 'number';
  if (!v.activities.every(validActivity)) return false;
  if (
    !v.routines.every(
      (r) =>
        record(r) &&
        typeof r.id === 'string' &&
        typeof r.title === 'string' &&
        typeof r.enabled === 'boolean' &&
        days(r.days) &&
        r.days.length > 0 &&
        Array.isArray(r.steps) &&
        r.steps.every(
          (s) =>
            record(s) &&
            typeof s.id === 'string' &&
            typeof s.title === 'string' &&
            typeof s.time === 'string' &&
            validTime(s.time) &&
            typeof s.duration === 'number' &&
            s.duration > 0 &&
            ['work', 'study', 'health', 'personal', 'rest'].includes(
              String(s.category),
            ),
        ),
    )
  )
    return false;
  if (
    !v.sessions.every(
      (s) =>
        record(s) &&
        typeof s.id === 'string' &&
        typeof s.title === 'string' &&
        typeof s.date === 'string' &&
        validDate(s.date) &&
        typeof s.seconds === 'number' &&
        s.seconds >= 0,
    )
  )
    return false;
  if (!Object.values(v.reviews).every((x) => typeof x === 'string'))
    return false;
  if (v.focus !== null) {
    const f = v.focus;
    if (
      !record(f) ||
      typeof f.title !== 'string' ||
      typeof f.duration !== 'number' ||
      typeof f.remaining !== 'number' ||
      f.duration <= 0 ||
      f.remaining < 0 ||
      f.remaining > f.duration ||
      typeof f.startedAt !== 'number' ||
      !(
        f.occurrenceDate === undefined ||
        (typeof f.occurrenceDate === 'string' && validDate(f.occurrenceDate))
      ) ||
      !(f.deadline === null || typeof f.deadline === 'number') ||
      !(f.activityId === null || typeof f.activityId === 'string')
    )
      return false;
  }
  return true;
}
