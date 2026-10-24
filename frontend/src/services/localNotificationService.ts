import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const localNotificationService = {
  async scheduleTest(): Promise<'scheduled' | 'denied'> {
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return 'denied';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Gatos da Corte · teste',
        body: 'Esta é uma notificação local de demonstração do aplicativo.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
    return 'scheduled';
  },
};
