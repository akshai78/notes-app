# Mino

A mobile-first Expo notes app built around one job: **get a thought down before it disappears**.

The home screen is a pastel card board with folders, tags, and checklists. A jot bar and a center plus button both start a note immediately. Notes auto-save on this device.

## Quick capture

- Type in the jot bar and tap **Save** — the note lands on the board without leaving home.
- Tap the black **+** button (or **Add new** on larger screens) to open a full editor with the keyboard ready.
- Empty notes are discarded when you go back, so the board stays clean.

## Run it on your phone

1. Install **[Expo Go](https://expo.dev/go)** (this app uses SDK 57).
2. From this repo:

   ```bash
   npm install
   npm start
   ```

   That is `expo start --go`. It prints a QR code and serves iOS, Android, and web.
3. Open the project in Expo Go:
   - **iPhone:** scan the QR code with the Camera app, then open in Expo Go
   - **Android:** open Expo Go and scan the QR code there

Phone and computer need the same Wi‑Fi. If they are on different networks:

```bash
npm run start:tunnel
```

Web:

```bash
npm run web
```

## Layouts

- **Phone:** bottom tabs with a raised plus button, one-column cards.
- **Tablet:** two-column note grid.
- **Desktop / large web:** sidebar navigation and up to three card columns.

Notes, folders, and profile live in AsyncStorage. Use **Restore sample notes** on the profile screen to reset the starter set.

## Stack

Expo SDK 57, Expo Router, TypeScript, React Native Web.
