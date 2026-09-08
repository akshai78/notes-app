import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function PageHeader({ title, subtitle, onBack, right }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.back} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <View style={styles.center}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    minHeight: 52,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
