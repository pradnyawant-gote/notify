import type { FocusRun } from './types';
export function remainingSeconds(run: FocusRun, now = Date.now()): number {
  return run.deadline
    ? Math.max(0, Math.ceil((run.deadline - now) / 1000))
    : run.remaining;
}
export function pauseRun(run: FocusRun, now = Date.now()): FocusRun {
  return { ...run, remaining: remainingSeconds(run, now), deadline: null };
}
export function resumeRun(run: FocusRun, now = Date.now()): FocusRun {
  return { ...run, deadline: now + run.remaining * 1000 };
}
