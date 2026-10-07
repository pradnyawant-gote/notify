export type ActivityType =
  'task' | 'reminder' | 'habit' | 'meeting' | 'focus' | 'personal';
export type Category = 'work' | 'study' | 'health' | 'personal' | 'rest';
export type Intensity = 'gentle' | 'balanced' | 'proactive';
export type ThemeMode = 'light' | 'dark' | 'system';
export interface Activity {
  id: string;
  title: string;
  notes: string;
  type: ActivityType;
  category: Category;
  date: string;
  time: string;
  duration: number;
  days: number[];
  completedOn: string[];
  reminder: boolean;
  leadMinutes: number;
  routineId?: string;
  enabled?: boolean;
}
export interface RoutineStep {
  id: string;
  title: string;
  time: string;
  duration: number;
  category: Category;
}
export interface Routine {
  id: string;
  title: string;
  days: number[];
  enabled: boolean;
  steps: RoutineStep[];
}
export interface Preferences {
  name: string;
  onboarded: boolean;
  demo: boolean;
  schedule: 'work' | 'study' | 'flexible';
  wake: string;
  sleep: string;
  workStart: string;
  workEnd: string;
  workDays: number[];
  goals: string[];
  theme: ThemeMode;
  intensity: Intensity;
  notifications: boolean;
  before: boolean;
  start: boolean;
  followUp: boolean;
  missed: boolean;
  breaks: boolean;
  habits: boolean;
  review: boolean;
}
export interface FocusRun {
  occurrenceDate?: string;
  activityId: string | null;
  title: string;
  duration: number;
  remaining: number;
  deadline: number | null;
  startedAt: number;
}
export interface FocusSession {
  id: string;
  date: string;
  title: string;
  seconds: number;
}
export interface AppState {
  version: 1;
  activities: Activity[];
  routines: Routine[];
  preferences: Preferences;
  focus: FocusRun | null;
  sessions: FocusSession[];
  reviews: Record<string, string>;
}
export type ReminderKind =
  'before' | 'start' | 'follow-up' | 'missed' | 'break' | 'habit' | 'review';
export interface PlannedReminder {
  id: string;
  activityId?: string;
  date: string;
  at: number;
  title: string;
  body: string;
  kind: ReminderKind;
}
