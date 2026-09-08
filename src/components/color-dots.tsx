import { Pressable, StyleSheet, View } from 'react-native';

import { PASTEL_ORDER, Pastels, Radius } from '@/constants/theme';
import type { NoteColorId } from '@/lib/types';

type Props = {
  value: NoteColorId;
  onChange: (color: NoteColorId) => void;
};

export function ColorDots({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {PASTEL_ORDER.map((color) => {
        const active = color === value;
        return (
          <Pressable
            key={color}
            onPress={() => onChange(color)}
            style={[
              styles.dot,
              { backgroundColor: Pastels[color].bg, borderColor: Pastels[color].accent },
              active && styles.active,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  active: {
    transform: [{ scale: 1.15 }],
    borderWidth: 2,
  },
});
