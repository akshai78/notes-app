import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <View style={styles.dotBack} />
        <View style={styles.dotFront} />
      </View>
      {!compact ? <Text style={styles.word}>Code Red</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotBack: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: '#C9C2FF',
    left: 2,
    top: 8,
  },
  dotFront: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  word: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },
});
