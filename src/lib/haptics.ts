import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function tap(): void {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function success(): void {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}
