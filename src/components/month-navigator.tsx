import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import { formatMonthYear } from '@/lib/dates';

type Props = {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
};

export function MonthNavigator({ date, onPrev, onNext }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onPrev} hitSlop={8} style={styles.nav}>
        <Ionicons name="chevron-back" size={16} color={Colors.textSoft} />
      </Pressable>
      <Text style={styles.label}>{formatMonthYear(date)}</Text>
      <Pressable onPress={onNext} hitSlop={8} style={styles.nav}>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSoft} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  nav: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSoft,
    minWidth: 110,
    textAlign: 'center',
  },
});
