import type { AppState } from '../domain/types';
export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}
export async function reconcileNotifications(_state: AppState): Promise<void> {}
export function listenForNotifications(
  _complete: (id: string, date: string) => void,
): () => void {
  return () => {};
}
export const notificationSupport =
  'Native notifications are available in the iOS and Android app. Your plans still work here.';
