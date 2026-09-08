import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function SearchBar({ value, onChange, placeholder = 'Find something', autoFocus }: Props) {
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable style={styles.wrap} onPress={() => inputRef.current?.focus()}>
      <Ionicons name="search" size={18} color={Colors.textMuted} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value ? (
        <Pressable onPress={() => onChange('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
        </Pressable>
      ) : (
        <View style={styles.shortcut}>
          <Ionicons name="key-outline" size={12} color={Colors.textMuted} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 10,
  },
  shortcut: {
    width: 28,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
