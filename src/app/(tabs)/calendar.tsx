import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { NoteCard } from '@/components/note-card';
import { Screen } from '@/components/screen';
import { Colors, Fonts, Layout, Radius } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { useResponsive } from '@/hooks/use-responsive';
import { formatDayLabel, formatMonthYear, noteCalendarDay, sameDay, startOfDay } from '@/lib/dates';
import { openNewNote } from '@/lib/notes-actions';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarScreen() {
  const { activeNotes, createNote, toggleCheckItem, selectedCalendarDay, setActiveCalendarDay } = useNotes();
  const { columns, contentPad, noteGap, showSidebar, width } = useResponsive();
  const selected = selectedCalendarDay ?? startOfDay();
  const [cursor, setCursor] = useState(() => new Date(selected));
  const [todayStart] = useState(() => startOfDay());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const pickDay = (day: number) => {
    setActiveCalendarDay(startOfDay(new Date(year, month, day)));
  };

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: startWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const notesByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of activeNotes) {
      const key = String(noteCalendarDay(note));
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [activeNotes]);

  const selectedNotes = activeNotes.filter((note) => sameDay(noteCalendarDay(note), selected));
  const innerWidth = Math.min(width - (showSidebar ? Layout.sidebarWidth : 0), Layout.maxContent);
  const usable = Math.max(innerWidth - contentPad * 2, 280);
  const cardWidth = columns === 1 ? usable : (usable - noteGap * (columns - 1)) / columns;

  const shift = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setCursor(next);
  };

  const addForSelected = () => openNewNote(createNote, { datedAt: selected });

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: contentPad, paddingBottom: 40, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Calendar</Text>
        <Text style={styles.title}>Notes by day</Text>

        <View style={styles.monthBar}>
          <Pressable onPress={() => shift(-1)} style={styles.nav}>
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </Pressable>
          <Text style={styles.month}>{formatMonthYear(cursor)}</Text>
          <Pressable onPress={() => shift(1)} style={styles.nav}>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((day) => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((day, index) => {
            if (!day) return <View key={`e-${index}`} style={styles.cell} />;
            const key = startOfDay(new Date(year, month, day));
            const active = sameDay(key, selected);
            const today = sameDay(key, todayStart);
            const count = notesByDay.get(String(key)) ?? 0;
            return (
              <Pressable
                key={`${year}-${month}-${day}`}
                onPress={() => pickDay(day)}
                style={[styles.cell, active && styles.cellActive, today && !active && styles.cellToday]}>
                <Text style={[styles.dayNum, active && styles.dayNumActive]}>{day}</Text>
                {count ? <View style={[styles.dot, active && styles.dotActive]} /> : <View style={styles.dotSpacer} />}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.listHead}>
          <Text style={styles.listTitle}>
            {selectedNotes.length
              ? `${selectedNotes.length} notes · ${formatDayLabel(selected)}`
              : formatDayLabel(selected)}
          </Text>
          <Pressable onPress={addForSelected} style={styles.add}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addLabel}>Note</Text>
          </Pressable>
        </View>

        {selectedNotes.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Nothing captured"
            body="Nothing on this day yet. Tap + to save a note here — including future dates."
            actionLabel="Add note"
            onAction={addForSelected}
          />
        ) : (
          <View style={[styles.notes, { gap: noteGap }]}>
            {selectedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                width={cardWidth}
                onPress={() => router.push(`/note/${note.id}`)}
                onMore={() => router.push(`/note/${note.id}`)}
                onToggleCheck={(itemId) => toggleCheckItem(note.id, itemId)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 4,
    marginBottom: 18,
  },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  month: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  nav: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cell: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cellActive: {
    backgroundColor: Colors.primary,
  },
  cellToday: {
    backgroundColor: Colors.primarySoft,
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  dayNumActive: {
    color: '#fff',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 3,
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  dotSpacer: {
    height: 8,
  },
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
  },
  listTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.ink,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
  },
  addLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  notes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
