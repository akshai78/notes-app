# Mino

A mobile-first Expo notes app built around one job: **get a thought down before it disappears**.

The home screen is a pastel card board with folders, tags, and checklists. A jot bar and a center plus button both start a note immediately. Notes auto-save on this device.

## Quick capture

- Type in the jot bar and tap **Save** — the note lands on the board without leaving home.
- Tap the black **+** button (or **Add new** on larger screens) to open a full editor with the keyboard ready.
- Empty notes are discarded when you go back, so the board stays clean.

## Run it

```bash
npm install
npx expo start
```

Then open it in Expo Go, an iOS simulator, an Android emulator, or the web app.

```bash
npx expo start --web --port 43147
```

## Layouts

- **Phone:** bottom tabs with a raised plus button, one-column cards.
- **Tablet:** two-column note grid.
- **Desktop / large web:** sidebar navigation and up to three card columns.

Notes, folders, and profile live in AsyncStorage. Use **Restore sample notes** on the profile screen to reset the starter set.

## Stack

Expo SDK 57, Expo Router, TypeScript, React Native Web.
