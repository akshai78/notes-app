import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Layout, Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

export function Screen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { showSidebar } = useResponsive();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: showSidebar ? Spacing.md : insets.top },
      ]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContent,
  },
});
