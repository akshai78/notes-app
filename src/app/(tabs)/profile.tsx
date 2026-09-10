import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CheckUpdateRow } from '@/components/check-update-row';
import { CloudAccount } from '@/components/cloud-account';
import { PromptModal } from '@/components/prompt-modal';
import { currentAppVersion } from '@/lib/app-update';
import { Screen } from '@/components/screen';
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { useResponsive } from '@/hooks/use-responsive';
import { openNewNote } from '@/lib/notes-actions';

export default function ProfileScreen() {
  const {
    profile,
    updateProfile,
    activeNotes,
    folders,
    archivedNotes,
    trashedNotes,
    resetDemo,
    createNote,
  } = useNotes();
  const { contentPad } = useResponsive();
  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const stats = [
    { label: 'Notes', value: activeNotes.length },
    { label: 'Folders', value: folders.length },
    { label: 'Archived', value: archivedNotes.length },
    { label: 'Trash', value: trashedNotes.length },
  ];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: contentPad, paddingBottom: 48, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Account</Text>
        <Text style={styles.title}>You</Text>

        <CloudAccount />

        <View style={[styles.card, Shadow.card]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'M'}</Text>
          </View>
          <Pressable onPress={() => setEditName(true)} style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
          </Pressable>
          <Pressable onPress={() => setEditEmail(true)} hitSlop={8}>
            <Ionicons name="create-outline" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.stats}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Shortcuts</Text>
        <Pressable onPress={() => openNewNote(createNote)} style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="flash-outline" size={18} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Quick note</Text>
            <Text style={styles.rowBody}>Opens a blank page with the keyboard ready.</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setEditName(true)} style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="person-outline" size={18} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Edit display name</Text>
            <Text style={styles.rowBody}>Shown in the greeting on the home screen.</Text>
          </View>
        </Pressable>
        <CheckUpdateRow />
        <Pressable onPress={resetDemo} style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: Colors.dangerSoft }]}>
            <Ionicons name="refresh-outline" size={18} color={Colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Restore sample notes</Text>
            <Text style={styles.rowBody}>Replace local data with the starter set.</Text>
          </View>
        </Pressable>

        <Text style={styles.about}>
          Notes save on this device first. Sign in with Clerk to sync them to Neon. Guests can keep writing without an
          account. Sign out or leave guest mode from the card above to return to welcome.
        </Text>
        <Text style={styles.version}>Code Red {currentAppVersion()}</Text>
      </ScrollView>

      <PromptModal
        visible={editName}
        title="Display name"
        initialValue={profile.name}
        onClose={() => setEditName(false)}
        onSubmit={(name) => updateProfile({ name })}
      />
      <PromptModal
        visible={editEmail}
        title="Email"
        initialValue={profile.email}
        onClose={() => setEditEmail(false)}
        onSubmit={(email) => updateProfile({ email })}
      />
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  email: {
    marginTop: 3,
    color: Colors.textMuted,
    fontSize: 13,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  stat: {
    flexGrow: 1,
    minWidth: 72,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  section: {
    marginTop: 28,
    marginBottom: 10,
    fontFamily: Fonts.bold,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontWeight: '700',
    color: Colors.text,
    fontSize: 15,
  },
  rowBody: {
    marginTop: 3,
    color: Colors.textMuted,
    fontSize: 12,
  },
  about: {
    marginTop: 18,
    color: Colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
  },
  version: {
    marginTop: 16,
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
