import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Missing', headerShown: false }} />
      <View style={styles.wrap}>
        <Text style={styles.title}>That page is gone</Text>
        <Text style={styles.body}>Head back to your notes and keep writing.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to notes</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
    padding: 24,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  body: {
    marginTop: 8,
    color: Colors.textSoft,
    textAlign: 'center',
  },
  link: {
    marginTop: 18,
    backgroundColor: Colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  linkText: {
    color: '#fff',
    fontWeight: '700',
  },
});
