import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import type { DateFilter } from '@/lib/types';

const OPTIONS: { id: DateFilter; label: string }[] = [
  { id: 'today', label: 'Todays' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

type Props = {
  value: DateFilter;
  onChange: (value: DateFilter) => void;
  includeAll?: boolean;
};

export function FilterTabs({ value, onChange, includeAll = false }: Props) {
  const options = includeAll ? [...OPTIONS, { id: 'all' as DateFilter, label: 'All' }] : OPTIONS;

  return (
    <View style={styles.row}>
      {options.map((option) => {
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
    gap: Spacing.lg,
  },
  item: {
    paddingBottom: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: Typography.tab.fontSize,
    color: Colors.textMuted,
    fontWeight: Typography.tab.fontWeight,
  },
  labelActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  underline: {
    marginTop: Spacing.sm,
    height: 2,
    borderRadius: 99,
    backgroundColor: 'transparent',
  },
  underlineActive: {
    backgroundColor: Colors.ink,
  },
});
