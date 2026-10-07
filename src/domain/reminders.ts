import type { Activity, PlannedReminder, Preferences, FocusRun } from './types';
import { activitiesForDate } from './activities';
import { addDays, atTime, dateKey, minutes } from './dates';
export const REMINDER_POLICY = {
  gentle: { budget: 4, spacing: 45 },
  balanced: { budget: 8, spacing: 25 },
  proactive: { budget: 12, spacing: 15 },
};
export function isQuiet(at: Date, p: Preferences): boolean {
  const current = at.getHours() * 60 + at.getMinutes(),
    wake = minutes(p.wake),
    sleep = minutes(p.sleep);
  return wake < sleep
    ? current < wake || current >= sleep
    : current >= sleep && current < wake;
}
export function planReminders(
  activities: Activity[],
  p: Preferences,
  now = new Date(),
  focus: FocusRun | null = null,
): PlannedReminder[] {
  if (!p.notifications || p.demo) return [];
  const policy = REMINDER_POLICY[p.intensity],
    plan: PlannedReminder[] = [];
  for (let day = 0; day < 7; day++) {
    const date = addDays(dateKey(now), day),
      candidates: PlannedReminder[] = [];
    for (const a of activitiesForDate(activities, date)) {
      if (
        !a.reminder ||
        a.completedOn.includes(date) ||
        (a.type === 'habit' && !p.habits) ||
        (a.category === 'rest' && !p.breaks)
      )
        continue;
      const start = atTime(date, a.time).getTime();
      const make = (
        offset: number,
        kind: PlannedReminder['kind'],
        body: string,
      ) =>
        candidates.push({
          id: `dayflow-${a.id}-${date}-${kind}`,
          activityId: a.id,
          date,
          at: start + offset * 60000,
          title: a.title,
          body,
          kind,
        });
      if (p.before && a.leadMinutes > 0)
        make(
          -a.leadMinutes,
          'before',
          `Coming up in ${a.leadMinutes} minutes. A little time to get ready.`,
        );
      if (p.start)
        make(
          0,
          a.type === 'habit'
            ? 'habit'
            : a.category === 'rest'
              ? 'break'
              : 'start',
          a.category === 'rest'
            ? 'A little pause for yourself. You have earned it.'
            : 'Your next moment is here. Take it one step at a time.',
        );
      if (p.followUp && a.type === 'task')
        make(
          a.duration,
          'follow-up',
          'How did it go? Mark it done or find a new moment.',
        );
      if (p.missed && a.type !== 'habit')
        make(
          a.duration + 30,
          'missed',
          'Still on your list. You can move this to a better time.',
        );
    }
    const reviewAt = atTime(date, p.sleep).getTime() - 30 * 60000;
    const review: PlannedReminder = {
      id: `dayflow-review-${date}`,
      date,
      at: reviewAt,
      kind: 'review',
      title: 'A moment to close your day',
      body: 'Notice your wins and make a little space for tomorrow.',
    };
    const eligible = (r: PlannedReminder) =>
      r.at > now.getTime() + 5000 &&
      !isQuiet(new Date(r.at), p) &&
      !(focus?.deadline && r.at >= now.getTime() && r.at < focus.deadline);
    // Reserve room for the end-of-day reminder and avoid a notification collision.
    const reserveReview = p.review && eligible(review);
    const selected: PlannedReminder[] = [];
    // Protect meetings and explicit reminders when the daily attention budget
    // is small. Low-priority follow-ups never crowd out the original activity.
    const priority = (r: PlannedReminder): number => {
      if (r.kind === 'missed' || r.kind === 'follow-up') return 0;
      const activity = activities.find((a) => a.id === r.activityId);
      if (activity?.type === 'meeting') return 5;
      if (activity?.type === 'reminder') return 4;
      if (activity?.type === 'focus') return 3;
      if (activity?.type === 'task') return 2;
      return 1;
    };
    candidates
      .sort((a, b) => priority(b) - priority(a) || a.at - b.at)
      .forEach((r) => {
        if (
          selected.length >= policy.budget - (reserveReview ? 1 : 0) ||
          !eligible(r)
        )
          return;
        if (reserveReview && Math.abs(r.at - reviewAt) < policy.spacing * 60000)
          return;
        if (
          selected.some((s) => Math.abs(s.at - r.at) < policy.spacing * 60000)
        )
          return;
        selected.push(r);
      });
    if (reserveReview) selected.push(review);
    plan.push(...selected);
  }
  return plan.sort((a, b) => a.at - b.at).slice(0, 48);
}
