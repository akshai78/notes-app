import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MobileTabBar } from '@/components/mobile-tab-bar';
import { Sidebar } from '@/components/sidebar';
import { Colors } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { useResponsive } from '@/hooks/use-responsive';
import { openNewNote } from '@/lib/notes-actions';

export default function TabsLayout() {
  const { showSidebar } = useResponsive();
  const { createNote, selectedCalendarDay } = useNotes();

  const create = (tab?: string) =>
    openNewNote(
      createNote,
      tab === 'calendar' && selectedCalendarDay ? { datedAt: selectedCalendarDay } : {}
    );

  return (
    <View style={styles.shell}>
      {showSidebar ? <Sidebar onCreate={() => create(selectedCalendarDay ? 'calendar' : undefined)} /> : null}
      <View style={styles.content}>
        <Tabs
          tabBar={(props) => {
            if (showSidebar) return null;
            const current = props.state.routes[props.state.index]?.name ?? 'index';
            return (
              <MobileTabBar
                current={current}
                onTab={(name) => props.navigation.navigate(name)}
                onCreate={() => create(current)}
              />
            );
          }}
          screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Colors.bg } }}>
          <Tabs.Screen name="index" options={{ title: 'Notes' }} />
          <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
          <Tabs.Screen name="archive" options={{ title: 'Archive' }} />
          <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.bg,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});
