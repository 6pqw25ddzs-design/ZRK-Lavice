import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api, hasAuthToken, registerDevicePush } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Registruje Expo push token na backend — poziva se pri svakom otvaranju aplikacije
// (anonimno, bez prijave) i poslije prijave (tada se token veže i za nalog).
// Tiho odustaje ako korisnik odbije dozvolu ili nije fizički uređaj.
export async function registerPushToken(): Promise<void> {
  try {
    if (!Device.isDevice) return;
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await registerDevicePush(token, Platform.OS);
    if (hasAuthToken()) await api.savePushToken(token, Platform.OS);
  } catch (e) {
    console.warn('Push registracija nije uspjela:', e);
  }
}
