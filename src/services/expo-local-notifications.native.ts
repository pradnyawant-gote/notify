/**
 * Local-only Expo Notifications facade for SDK 57.
 *
 * The package's main entry point also loads DevicePushTokenAutoRegistration.fx,
 * which subscribes to remote push tokens at import time and throws in Android
 * Expo Go. DayFlow never requests a push token, so import only the documented
 * local APIs from their SDK build modules. Keep this boundary covered when
 * upgrading Expo; do not import the package barrel elsewhere at runtime.
 */
export {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
export { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
export { setNotificationCategoryAsync } from 'expo-notifications/build/setNotificationCategoryAsync';
export { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
export { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
export { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
export { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
export {
  addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync,
  clearLastNotificationResponseAsync,
} from 'expo-notifications/build/NotificationsEmitter';
export { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
export { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
export type { NotificationResponse } from 'expo-notifications/build/Notifications.types';
