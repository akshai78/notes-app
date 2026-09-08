import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <View style={styles.ring} />
      </View>
      {!compact ? <Text style={styles.word}>Code Red</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mark: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    borderWidth: 3,
    borderColor: Colors.text,
  },
  word: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
