import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { tap } from '@/lib/haptics';

type Props = {
  onSubmit: (text: string) => void;
  onExpand?: (text: string) => void;
};

export function QuickCapture({ onSubmit, onExpand }: Props) {
  const [text, setText] = useState('');

  const save = () => {
    const value = text.trim();
    if (!value) {
      onExpand?.('');
      return;
    }
    tap();
    onSubmit(value);
    setText('');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Ionicons name="flash-outline" size={16} color={Colors.textSoft} />
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Quick capture — jot a thought"
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={save}
        blurOnSubmit
      />
      <Pressable onPress={save} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>{text.trim() ? 'Save' : 'Open'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  button: {
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing.md,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  buttonLabel: {
    color: '#fff',
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    fontSize: 13,
  },
});
