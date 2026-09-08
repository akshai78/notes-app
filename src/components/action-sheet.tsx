import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';

export type ActionItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  title?: string;
  actions: ActionItem[];
  onClose: () => void;
};

export function ActionSheet({ visible, title, actions, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {actions.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => {
                onClose();
                action.onPress();
              }}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Ionicons
                name={action.icon}
                size={18}
                color={action.destructive ? Colors.danger : Colors.text}
              />
              <Text style={[styles.label, action.destructive && styles.danger]}>{action.label}</Text>
            </Pressable>
          ))}
          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelLabel}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
    padding: 16,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 12,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
  },
  pressed: {
    backgroundColor: Colors.bg,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  danger: {
    color: Colors.danger,
  },
  cancel: {
    marginTop: 4,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelLabel: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
