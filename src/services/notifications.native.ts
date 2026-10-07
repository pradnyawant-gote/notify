import * as Notifications from './expo-local-notifications.native';
import { Platform } from 'react-native';
import type { AppState } from '../domain/types';
import { planReminders } from '../domain/reminders';
export const notificationSupport =
  'DayFlow sends local reminders directly from this device. No account needed.';
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android')
    await Notifications.setNotificationChannelAsync('dayflow-calm', {
      name: 'DayFlow reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 120],
      lightColor: '#007AFF',
    });
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.granted
    ? existing
    : await Notifications.requestPermissionsAsync();
  if (permission.granted)
    await Notifications.setNotificationCategoryAsync('dayflow-activity', [
      {
        identifier: 'COMPLETE',
        buttonTitle: 'Mark complete',
        options: { opensAppToForeground: true },
      },
    ]);
  return permission.granted;
}
let queue: Promise<void> = Promise.resolve();
export function reconcileNotifications(state: AppState): Promise<void> {
  const job = async () => {
    const focus = state.focus;
    Notifications.setNotificationHandler({
      handleNotification: async (n) => {
        const suppressed = Boolean(
          focus?.deadline &&
          focus.deadline > Date.now() &&
          n.request.content.data?.kind !== 'focus',
        );
        return {
          shouldShowBanner: !suppressed,
          shouldShowList: !suppressed,
          shouldPlaySound: false,
          shouldSetBadge: false,
        };
      },
    });
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of pending)
      if (item.identifier.startsWith('dayflow-'))
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
    if (
      !state.preferences.notifications ||
      state.preferences.demo ||
      !(await Notifications.getPermissionsAsync()).granted
    )
      return;
    const plan = planReminders(
      state.activities,
      state.preferences,
      new Date(),
      state.focus,
    );
    for (const r of plan)
      await Notifications.scheduleNotificationAsync({
        identifier: r.id,
        content: {
          title: r.title,
          body: r.body,
          sound: false,
          categoryIdentifier: r.activityId ? 'dayflow-activity' : undefined,
          data: { activityId: r.activityId ?? '', date: r.date, kind: r.kind },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(r.at),
          channelId: 'dayflow-calm',
        },
      });
    if (focus?.deadline && focus.deadline > Date.now())
      await Notifications.scheduleNotificationAsync({
        identifier: 'dayflow-focus-finish',
        content: {
          title: 'A little progress, well earned',
          body: `Your focus session for ${focus.title} is complete. Time for a breath.`,
          sound: false,
          data: { kind: 'focus' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(focus.deadline),
          channelId: 'dayflow-calm',
        },
      });
  };
  queue = queue.catch(() => {}).then(job);
  return queue;
}
export function listenForNotifications(
  complete: (id: string, date: string) => void,
): () => void {
  const consume = (r: Notifications.NotificationResponse) => {
    const data = r.notification.request.content.data;
    if (
      r.actionIdentifier === 'COMPLETE' &&
      data &&
      typeof data.activityId === 'string' &&
      typeof data.date === 'string'
    )
      complete(data.activityId, data.date);
  };
  const sub = Notifications.addNotificationResponseReceivedListener(consume);
  void Notifications.getLastNotificationResponseAsync()
    .then((r) => {
      if (r) {
        consume(r);
        void Notifications.clearLastNotificationResponseAsync();
      }
    })
    .catch(() => {});
  return () => sub.remove();
}
