import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Fonts, Radius, Shadow } from '@/constants/theme';
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
    <View style={[styles.wrap, Shadow.card]}>
      <View style={styles.icon}>
        <Ionicons name="flash" size={16} color={Colors.primary} />
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Jot a thought — tap save or press return"
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={save}
        blurOnSubmit
      />
      <Pressable onPress={save} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>{text.trim() ? 'Save' : 'Open'}</Text>
        <Ionicons name={text.trim() ? 'arrow-up' : 'create-outline'} size={14} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.ink,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    color: '#fff',
    fontFamily: Fonts.semibold,
    fontWeight: '700',
    fontSize: 13,
  },
});
