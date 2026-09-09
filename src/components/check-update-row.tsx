import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { checkForAppUpdate, currentAppVersion } from '@/lib/app-update';

export function CheckUpdateRow() {
  const [status, setStatus] = useState(`This install is ${currentAppVersion()}.`);
  const [busy, setBusy] = useState(false);

  return (
    <Pressable
      disabled={busy}
      onPress={async () => {
        setBusy(true);
        const latest = await checkForAppUpdate();
        setBusy(false);
        if (!latest) {
          setStatus(`You are on the latest version (${currentAppVersion()}).`);
          return;
        }
        setStatus(`${latest.title} is available.`);
        await Linking.openURL(latest.apkUrl || latest.pageUrl);
      }}
      style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name="download-outline" size={18} color={Colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{busy ? 'Checking…' : 'Check for update'}</Text>
        <Text style={styles.body}>{status}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    color: Colors.text,
    fontSize: 15,
  },
  body: {
    marginTop: 3,
    color: Colors.textMuted,
    fontSize: 12,
  },
});
