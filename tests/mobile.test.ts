import assert from 'node:assert/strict';
import test from 'node:test';
import { METRIC_GAP, metricGridLayout } from '../src/domain/layout';
import { nextActionableActivity } from '../src/domain/activities';
import { atTime } from '../src/domain/dates';
import type { Activity } from '../src/domain/types';

test('phone metric columns are equal and fill the measured container', () => {
  const result = metricGridLayout(358);
  assert.equal(result.columns, 2);
  assert.equal(result.cardWidth * 2 + METRIC_GAP, 358);
});

test('metrics never overflow phone, tablet, or fractional native widths', () => {
  for (const width of [288, 320, 348, 358, 378.6, 600, 800]) {
    for (const fontScale of [1, 1.15, 1.4, 2]) {
      const layout = metricGridLayout(width, fontScale);
      assert.ok(layout.cardWidth > 0);
      assert.ok(
        layout.cardWidth * layout.columns + METRIC_GAP * (layout.columns - 1) <=
          width,
      );
    }
  }
});

test('small screens and larger Android font sizes use a readable single column', () => {
  assert.equal(metricGridLayout(288).columns, 1);
  assert.equal(metricGridLayout(358, 1.4).columns, 1);
  assert.deepEqual(metricGridLayout(Number.NaN), { columns: 1, cardWidth: 0 });
});

const activity = (id: string, time: string): Activity => ({
  id,
  time,
  date: '2026-10-07',
  title: id,
  notes: '',
  duration: 30,
  days: [],
  completedOn: [],
  reminder: false,
  leadMinutes: 0,
  type: 'task',
  category: 'work',
});
test('the dashboard surfaces unfinished morning activities instead of claiming all clear', () => {
  const morning = activity('morning', '07:00');
  assert.equal(
    nextActionableActivity(
      [morning],
      morning.date,
      atTime(morning.date, '11:05').getTime(),
    )?.id,
    morning.id,
  );
});

test('current and upcoming activities take priority, and completed occurrences are excluded', () => {
  const missed = activity('missed', '07:00'),
    current = activity('current', '11:00'),
    upcoming = activity('upcoming', '12:00');
  const now = atTime(current.date, '11:05').getTime();
  assert.equal(
    nextActionableActivity([missed, upcoming, current], current.date, now)?.id,
    current.id,
  );
  current.completedOn = [current.date];
  assert.equal(
    nextActionableActivity([missed, upcoming, current], current.date, now)?.id,
    upcoming.id,
  );
  missed.completedOn = [missed.date];
  upcoming.completedOn = [upcoming.date];
  assert.equal(
    nextActionableActivity([missed, upcoming, current], current.date, now),
    undefined,
  );
});
