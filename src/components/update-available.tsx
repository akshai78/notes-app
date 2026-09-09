import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import {
  checkForAppUpdate,
  currentAppVersion,
  dismissUpdate,
  isUpdateDismissed,
  type AppUpdate,
} from '@/lib/app-update';

type Props = {
  enabled?: boolean;
};

export function UpdateAvailable({ enabled = true }: Props) {
  const [update, setUpdate] = useState<AppUpdate | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    checkForAppUpdate().then(async (latest) => {
      if (!mounted || !latest) return;
      const skipped = await isUpdateDismissed(latest.version);
      if (!mounted || skipped) return;
      setUpdate(latest);
      setVisible(true);
    });
    return () => {
      mounted = false;
    };
  }, [enabled]);

  if (!update) return null;

  const later = async () => {
    await dismissUpdate(update.version);
    setVisible(false);
  };

  const install = async () => {
    await Linking.openURL(update.apkUrl || update.pageUrl);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={later}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={later} />
        <View style={styles.card}>
          <View style={styles.icon}>
            <Ionicons name="cloud-download-outline" size={22} color="#fff" />
          </View>
          <Text style={styles.kicker}>Update available</Text>
          <Text style={styles.title}>{update.title}</Text>
          <Text style={styles.body}>
            You are on {currentAppVersion()}. A newer install is ready. Download it, then open the file to update Code
            Red. Your notes stay on this phone.
          </Text>
          {update.notes ? (
            <Text numberOfLines={5} style={styles.notes}>
              {update.notes}
            </Text>
          ) : null}
          <Pressable onPress={install} style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}>
            <Text style={styles.primaryLabel}>Download update</Text>
          </Pressable>
          <Pressable onPress={later} style={styles.later}>
            <Text style={styles.laterLabel}>Later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  kicker: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    marginTop: Spacing.xs,
    fontFamily: Fonts.bold,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  body: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSoft,
  },
  notes: {
    marginTop: Spacing.md,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  primary: {
    marginTop: Spacing.lg,
    minHeight: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: '#fff',
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 16,
  },
  later: {
    marginTop: Spacing.sm,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterLabel: {
    color: Colors.textSoft,
    fontWeight: '600',
    fontSize: 14,
  },
});
