import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  confirmLabel?: string;
  initialValue?: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
};

type FormProps = Omit<Props, 'visible'>;

function PromptForm({
  title,
  message,
  placeholder,
  confirmLabel = 'Save',
  initialValue = '',
  onClose,
  onSubmit,
}: FormProps) {
  const [value, setValue] = useState(initialValue);

  const submit = () => {
    const next = value.trim();
    if (!next) return;
    onSubmit(next);
    onClose();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          autoFocus
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <View style={styles.actions}>
          <Pressable onPress={onClose} style={styles.ghost}>
            <Text style={styles.ghostLabel}>Cancel</Text>
          </Pressable>
          <Pressable onPress={submit} style={styles.primary}>
            <Text style={styles.primaryLabel}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export function PromptModal({ visible, initialValue = '', title, ...rest }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={rest.onClose}>
      {visible ? <PromptForm key={`${title}-${initialValue}`} title={title} initialValue={initialValue} {...rest} /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 20,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  message: {
    marginTop: 6,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSoft,
    lineHeight: 20,
  },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
    backgroundColor: Colors.bg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  ghost: {
    height: 42,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostLabel: {
    color: Colors.textSoft,
    fontWeight: '600',
  },
  primary: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '700',
  },
});
