import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import type { DateFilter } from '@/lib/types';

const OPTIONS: { id: DateFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All' },
];

type Props = {
  value: DateFilter;
  onChange: (value: DateFilter) => void;
};

export function FilterTabs({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <Pressable key={option.id} onPress={() => onChange(option.id)} style={styles.item}>
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
            <View style={[styles.underline, active && styles.underlineActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  item: {
    paddingBottom: 4,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  underline: {
    marginTop: 6,
    height: 3,
    borderRadius: 99,
    backgroundColor: 'transparent',
  },
  underlineActive: {
    backgroundColor: Colors.primary,
  },
});
