import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'codered.guest.v1';

export async function loadGuest(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function saveGuest(value: boolean): Promise<void> {
  try {
    if (value) await AsyncStorage.setItem(KEY, '1');
    else await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
