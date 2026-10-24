import { initialNotificationPreferences } from '../mocks/settings';
import { NotificationPreferences } from '../types/settings';

let preferences = { ...initialNotificationPreferences };

export const settingsRepository = {
  getNotifications: (): NotificationPreferences => ({ ...preferences }),
  setNotifications: (next: NotificationPreferences): NotificationPreferences => {
    preferences = { ...next };
    return { ...preferences };
  },
};
