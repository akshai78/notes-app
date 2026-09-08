import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={28} color={Colors.textSoft} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.button}>
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  body: {
    marginTop: 8,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSoft,
    textAlign: 'center',
    maxWidth: 320,
  },
  button: {
    marginTop: 16,
    backgroundColor: Colors.ink,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '700',
  },
});
