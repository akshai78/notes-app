# Code Red

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

   That starts Code Red on port **47391** (not 8081 — 8081 is often another Expo app). The terminal must say `Starting project at .../notes-app` and `Web: http://localhost:47391`. Confirm the build on **You → Code Red 1.1**.
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

Notes, folders, and profile live on the device (AsyncStorage). Use **Restore sample notes** on the profile screen to reset the starter set.

## Cloud sync (Supabase)

This is an Expo app, so the client uses `@supabase/supabase-js` with AsyncStorage sessions — not the Next.js cookie/middleware helpers.

1. Copy `.env.example` to `.env` (already set for this project).
2. In the [Supabase SQL editor](https://supabase.com/dashboard/project/tdjderirryagsqjenosu/sql), run `supabase/schema.sql`.
3. On **You**, create an account or sign in. Notes stay local until the sync engine is turned on; the session is already persisted.

## Installable Android & iOS apps

Use **[EAS Build](https://docs.expo.dev/build/introduction/)** (Expo’s cloud build service) to create files you can install without Expo Go.

### One-time setup

1. Create a free account at [expo.dev](https://expo.dev/signup).
2. In the project folder:

   ```bash
   npm install
   npx eas login
   npx eas init
   ```

   `eas init` links this repo to your Expo project and adds a project ID to `app.json`.

### Android — installable APK (Code Red 1.1)

**Download:** [CodeRed-1.1.apk](https://github.com/akshai78/notes-app/releases/latest/download/CodeRed-1.1.apk) from GitHub Releases.

On your phone:

1. Download the APK.
2. Open it and allow **Install from unknown sources** if Android asks.
3. Install **Code Red**.

**Build your own APK (cloud, recommended):**

```bash
npm install
npx eas login
npx eas init
npm run build:apk
```

EAS prints a download link when the build finishes (~10 minutes).

**Build locally (needs Android SDK + Java 17):**

```bash
npm run build:apk:local
```

Output: `releases/CodeRed-1.1.apk`

For Google Play later, use `npm run build:android:store` (AAB format).

### iOS — install on iPhone

You need an **[Apple Developer account](https://developer.apple.com/programs/)** ($99/year) to install on a real iPhone outside the App Store.

```bash
npm run build:ios
```

EAS will walk you through Apple credentials (or create them for you). After the build:

- **TestFlight** (recommended): submit the build to App Store Connect and install via the TestFlight app.
- **Ad hoc**: register your iPhone’s UDID in the Apple Developer portal, then install from the EAS download link.

Build both platforms at once:

```bash
npm run build:all
```

### Build profiles

| Script | Output | Use |
|--------|--------|-----|
| `npm run build:android` | APK | Direct install on Android |
| `npm run build:ios` | IPA | TestFlight / ad hoc on iPhone |
| `npm run build:android:store` | AAB | Google Play upload |
| `npm run build:ios:store` | IPA | App Store / TestFlight |

See `eas.json` for profile details.

## Stack

Expo SDK 57, Expo Router, TypeScript, React Native Web.
