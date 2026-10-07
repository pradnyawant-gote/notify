import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState as NativeAppState } from 'react-native';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Activity, AppState, Preferences, Routine } from '../domain/types';
import { dateKey } from '../domain/dates';
import { routineActivities } from '../domain/activities';
import { pauseRun, remainingSeconds, resumeRun } from '../domain/focus';
import { createInitialState } from './seed';
import { validState } from './validation';
import {
  listenForNotifications,
  reconcileNotifications,
} from '../services/notifications';
const STORAGE_KEY = 'dayflow.local.v1';
export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
interface Store {
  state: AppState;
  hydrated: boolean;
  toast: string | null;
  notify: (message: string) => void;
  saveActivity: (a: Activity) => void;
  deleteActivity: (id: string) => void;
  toggleComplete: (id: string, date: string) => void;
  setPreferences: (p: Partial<Preferences>) => void;
  finishOnboarding: (p: Preferences) => void;
  enterDemo: () => void;
  saveRoutine: (r: Routine) => void;
  deleteRoutine: (id: string) => void;
  startFocus: (
    id: string | null,
    title: string,
    duration: number,
    occurrenceDate?: string,
  ) => void;
  toggleFocus: () => void;
  finishFocus: (complete?: boolean) => void;
  saveReview: (date: string, note: string) => void;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState),
    [hydrated, setHydrated] = useState(false),
    [toast, setToast] = useState<string | null>(null);
  const storageQueue = useRef(Promise.resolve()),
    latest = useRef(state),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  latest.current = state;
  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 4000);
  }, []);
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          try {
            const parsed: unknown = JSON.parse(raw);
            if (!validState(parsed)) throw new Error('invalid');
            setState(parsed);
          } catch {
            notify(
              'Your saved data could not be loaded. A fresh example day is ready.',
            );
          }
        }
        setHydrated(true);
      })
      .catch(() => {
        if (alive) {
          notify('Storage is unavailable. Changes will last for this session.');
          setHydrated(true);
        }
      });
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [notify]);
  useEffect(() => {
    if (!hydrated) return;
    storageQueue.current = storageQueue.current
      .catch(() => {})
      .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)))
      .catch(() => {
        notify(
          'Could not save to this device. Keep the app open and try again.',
        );
      });
    const t = setTimeout(() => {
      void reconcileNotifications(state).catch(() =>
        notify(
          'Reminders could not be scheduled. Check notification permission in Profile.',
        ),
      );
    }, 350);
    return () => clearTimeout(t);
  }, [state, hydrated, notify]);
  useEffect(() => {
    const sub = NativeAppState.addEventListener('change', (value) => {
      if (value === 'active' && hydrated)
        void reconcileNotifications(latest.current).catch(() =>
          notify('Could not refresh your reminders.'),
        );
    });
    return () => sub.remove();
  }, [hydrated, notify]);
  useEffect(
    () =>
      listenForNotifications((id, date) =>
        setState((s) => ({
          ...s,
          activities: s.activities.map((a) =>
            a.id === id && !a.completedOn.includes(date)
              ? { ...a, completedOn: [...a.completedOn, date] }
              : a,
          ),
        })),
      ),
    [],
  );
  const saveRoutine = (r: Routine) =>
    setState((s) => {
      const templates = routineActivities(r, dateKey()).map((a) => {
        const old = s.activities.find((b) => b.id === a.id);
        return old ? { ...a, date: old.date, completedOn: old.completedOn } : a;
      });
      return {
        ...s,
        routines: [...s.routines.filter((x) => x.id !== r.id), r],
        activities: [
          ...s.activities.filter((a) => a.routineId !== r.id),
          ...templates,
        ],
      };
    });
  return (
    <Context.Provider
      value={{
        state,
        hydrated,
        toast,
        notify,
        saveActivity: (a) =>
          setState((s) => ({
            ...s,
            activities: [...s.activities.filter((x) => x.id !== a.id), a],
          })),
        deleteActivity: (id) =>
          setState((s) => ({
            ...s,
            activities: s.activities.filter((a) => a.id !== id),
          })),
        toggleComplete: (id, date) => {
          if (Platform.OS !== 'web')
            void Haptics.selectionAsync().catch(() => {});
          setState((s) => ({
            ...s,
            activities: s.activities.map((a) =>
              a.id === id
                ? {
                    ...a,
                    completedOn: a.completedOn.includes(date)
                      ? a.completedOn.filter((d) => d !== date)
                      : [...a.completedOn, date],
                  }
                : a,
            ),
          }));
        },
        setPreferences: (p) =>
          setState((s) => ({ ...s, preferences: { ...s.preferences, ...p } })),
        enterDemo: () => {
          const sample = createInitialState();
          setState({
            ...sample,
            preferences: { ...sample.preferences, onboarded: true },
          });
        },
        finishOnboarding: (p) =>
          setState((s) => ({
            ...s,
            preferences: { ...p, onboarded: true, demo: false },
            activities: [],
            sessions: [],
            routines: [],
            reviews: {},
            focus: null,
          })),
        saveRoutine,
        deleteRoutine: (id) =>
          setState((s) => ({
            ...s,
            routines: s.routines.filter((r) => r.id !== id),
            activities: s.activities.filter((a) => a.routineId !== id),
          })),
        startFocus: (id, title, duration, occurrenceDate = dateKey()) =>
          setState((s) => ({
            ...s,
            focus: {
              occurrenceDate,
              activityId: id,
              title,
              duration: duration * 60,
              remaining: duration * 60,
              deadline: Date.now() + duration * 60000,
              startedAt: Date.now(),
            },
          })),
        toggleFocus: () =>
          setState((s) => ({
            ...s,
            focus: s.focus
              ? s.focus.deadline
                ? pauseRun(s.focus)
                : resumeRun(s.focus)
              : null,
          })),
        finishFocus: (complete = false) =>
          setState((s) => {
            if (!s.focus) return s;
            const seconds = Math.max(
              0,
              s.focus.duration - remainingSeconds(s.focus),
            );
            const date = dateKey();
            const occurrenceDate = s.focus.occurrenceDate ?? date;
            return {
              ...s,
              focus: null,
              sessions:
                seconds > 0
                  ? [
                      ...s.sessions,
                      { id: uid(), date, title: s.focus.title, seconds },
                    ]
                  : s.sessions,
              activities: complete
                ? s.activities.map((a) =>
                    a.id === s.focus?.activityId &&
                    !a.completedOn.includes(occurrenceDate)
                      ? {
                          ...a,
                          completedOn: [...a.completedOn, occurrenceDate],
                        }
                      : a,
                  )
                : s.activities,
            };
          }),
        saveReview: (date, note) =>
          setState((s) => ({ ...s, reviews: { ...s.reviews, [date]: note } })),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore(): Store {
  const s = useContext(Context);
  if (!s) throw new Error('StoreProvider is missing');
  return s;
}
export function useClock(): Date {
  const { state } = useStore(),
    [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  if (state.preferences.demo) {
    const d = new Date();
    d.setHours(10, 15, 0, 0);
    return d;
  }
  return now;
}
