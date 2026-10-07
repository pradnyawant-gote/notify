import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activitiesForDate,
  activityStatus,
  findGap,
  hasConflict,
} from '../src/domain/activities';
import {
  addDays,
  atTime,
  dateKey,
  validDate,
  validTime,
} from '../src/domain/dates';
import { remainingSeconds, pauseRun, resumeRun } from '../src/domain/focus';
import {
  isQuiet,
  planReminders,
  REMINDER_POLICY,
} from '../src/domain/reminders';
import { createInitialState, defaultPreferences } from '../src/store/seed';
import { validState } from '../src/store/validation';
import type { Activity, Preferences } from '../src/domain/types';
const p: Preferences = {
  ...defaultPreferences,
  demo: false,
  notifications: true,
};
const make = (id: string, time = '09:00'): Activity => ({
  id,
  title: 'Deep work',
  date: '2026-10-07',
  time,
  duration: 30,
  days: [],
  completedOn: [],
  category: 'work',
  type: 'task',
  notes: '',
  reminder: true,
  leadMinutes: 5,
});
test('recurrence starts on its chosen date and completion belongs to one occurrence', () => {
  const a = {
    ...make('daily'),
    days: [1, 2, 3, 4, 5],
    completedOn: ['2026-10-07'],
  };
  assert.equal(activitiesForDate([a], '2026-10-06').length, 0);
  assert.equal(activitiesForDate([a], '2026-10-08').length, 1);
  assert.equal(activitiesForDate([a], '2026-10-10').length, 0);
  assert.equal(
    activityStatus(a, '2026-10-07', atTime('2026-10-07', '09:10').getTime()),
    'completed',
  );
  assert.equal(
    activityStatus(a, '2026-10-08', atTime('2026-10-08', '09:10').getTime()),
    'current',
  );
});
test('gap finder does not overlap existing blocks and respects capacity', () => {
  const activities = [make('a', '09:00'), make('b', '09:45')];
  assert.equal(
    findGap(activities, '2026-10-07', 30, p, atTime('2026-10-07', '08:00')),
    '10:15',
  );
  assert.equal(
    findGap(activities, '2026-10-07', 90, p, atTime('2026-10-07', '16:00')),
    null,
  );
  assert.equal(hasConflict(activities, make('c', '09:20')), true);
  assert.equal(hasConflict(activities, make('a', '09:00')), false);
});
test('quiet hours work across midnight and for daytime sleepers', () => {
  assert.equal(isQuiet(atTime('2026-10-07', '23:05'), p), true);
  assert.equal(isQuiet(atTime('2026-10-07', '06:59'), p), true);
  assert.equal(isQuiet(atTime('2026-10-07', '07:00'), p), false);
  const night = { ...p, wake: '17:00', sleep: '08:00' };
  assert.equal(isQuiet(atTime('2026-10-07', '12:00'), night), true);
  assert.equal(isQuiet(atTime('2026-10-07', '23:00'), night), false);
});
test('paused routines hide future occurrences while retaining completed moments', () => {
  const a = {
    ...make('paused'),
    days: [1, 2, 3, 4, 5],
    enabled: false,
    completedOn: ['2026-10-07'],
  };
  assert.equal(activitiesForDate([a], '2026-10-07').length, 1);
  assert.equal(activitiesForDate([a], '2026-10-08').length, 0);
  assert.equal(
    findGap([], '2026-10-10', 30, p, atTime('2026-10-07', '08:00')),
    null,
  );
});
test('daily reminder budgets, spacing, completion, and focus suppression are enforced', () => {
  const activities = Array.from({ length: 20 }, (_, i) =>
    make(
      String(i),
      `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`,
    ),
  );
  const now = atTime('2026-10-07', '07:00');
  for (const intensity of ['gentle', 'balanced', 'proactive'] as const) {
    const plan = planReminders(
      activities,
      { ...p, intensity, followUp: true, missed: true },
      now,
    );
    assert.ok(
      plan.filter((r) => r.date === '2026-10-07').length <=
        REMINDER_POLICY[intensity].budget,
    );
    for (let i = 1; i < plan.length; i++)
      assert.ok(
        plan[i].at - plan[i - 1].at >=
          REMINDER_POLICY[intensity].spacing * 60000,
      );
    assert.ok(plan.some((r) => r.kind === 'review'));
  }
  const focus = {
    activityId: null,
    title: 'Focus',
    duration: 14400,
    remaining: 14400,
    startedAt: now.getTime(),
    deadline: atTime('2026-10-07', '11:00').getTime(),
  };
  assert.ok(
    planReminders(activities, p, now, focus).every(
      (r) => r.at >= focus.deadline,
    ),
  );
  assert.equal(
    planReminders(
      [{ ...make('done'), completedOn: ['2026-10-07'] }],
      { ...p, review: false },
      now,
    ).length,
    0,
  );
  assert.equal(
    planReminders(activities, { ...p, notifications: false }, now).length,
    0,
  );
  assert.equal(planReminders(activities, { ...p, demo: true }, now).length, 0);
});
test('meetings retain a reminder when earlier routine nudges fill a gentle budget', () => {
  const habits = ['07:00', '08:00', '09:00', '10:00'].map((time, i) => ({
    ...make(`habit-${i}`, time),
    type: 'habit' as const,
  }));
  const meeting = {
    ...make('important-meeting', '15:00'),
    type: 'meeting' as const,
  };
  const plan = planReminders(
    [...habits, meeting],
    p,
    atTime('2026-10-07', '06:00'),
  );
  assert.ok(plan.some((r) => r.activityId === meeting.id));
  assert.ok(plan.filter((r) => r.date === meeting.date).length <= 4);
});
test('rolling notification queue stays below native pending limit and filters expired reminders', () => {
  const activities = Array.from({ length: 20 }, (_, i) => ({
    ...make(String(i), `${String(7 + (i % 15)).padStart(2, '0')}:00`),
    days: [0, 1, 2, 3, 4, 5, 6],
  }));
  const now = atTime('2026-10-07', '10:00'),
    plan = planReminders(activities, { ...p, intensity: 'proactive' }, now);
  assert.ok(plan.length <= 48);
  assert.ok(plan.every((r) => r.at > now.getTime()));
  assert.equal(new Set(plan.map((r) => r.id)).size, plan.length);
});
test('focus timer is based on deadlines and pauses without losing elapsed progress', () => {
  const run = {
    activityId: null,
    title: 'Focus',
    duration: 1500,
    remaining: 1500,
    startedAt: 100000,
    deadline: 1600000,
  };
  assert.equal(remainingSeconds(run, 400000), 1200);
  const paused = pauseRun(run, 400000);
  assert.equal(remainingSeconds(paused, 900000), 1200);
  const resumed = resumeRun(paused, 900000);
  assert.equal(remainingSeconds(resumed, 1200000), 900);
  assert.equal(remainingSeconds(resumed, 99999999), 0);
});
test('local date arithmetic and form validation reject impossible input', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(dateKey(atTime('2026-10-07', '10:00')), '2026-10-07');
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validTime('24:00'), false);
  assert.equal(validTime('09:30'), true);
});
test('storage schema accepts seeded data and rejects malformed activity or preferences', () => {
  const state = createInitialState();
  assert.equal(validState(state), true);
  assert.equal(
    validState({
      ...state,
      preferences: { ...state.preferences, intensity: 'infinite' },
    }),
    false,
  );
  assert.equal(
    validState({
      ...state,
      activities: [{ ...state.activities[0], time: '30:90' }],
    }),
    false,
  );
  assert.equal(validState({ ...state, focus: { title: 'bad' } }), false);
});
