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

   After `git pull`, always run **`npm install`** once so new packages (like `@clerk/expo`) are installed. The start scripts also auto-install if that package is missing.

   That starts Code Red on port **47391** (not 8081 — 8081 is often another Expo app). The terminal must say `Starting project at .../notes-app` and `Web: http://localhost:47391`. Confirm the build on **You → Code Red 1.2**.
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

## Cloud sync (Clerk + Neon + Vercel)

Notes still save on the device first (AsyncStorage). When you sign in with **Clerk**, the Expo app syncs folders, notes, and profile to **Neon Postgres** through the Next.js app in `server/`. Last write wins on `updated_at`. Guests stay local-only.

### 1. Clerk

1. Create an application at [clerk.com](https://dashboard.clerk.com).
2. Enable **Email** + **Password**. For verify-at-sign-up, use **email code**.
3. Turn on **Native API** (Clerk Dashboard → Native applications).
4. Add redirect `codered://welcome` (and `http://localhost:47391` for Expo web).
5. Copy the publishable key into the Expo `.env` as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
6. Copy the secret key into `server/.env.local` as `CLERK_SECRET_KEY`.

### 2. Neon

1. Create a Postgres database. Use the **pooled** connection string (`-pooler` in the host).
2. Put it in `server/.env.local` as `DATABASE_URL`.
3. Apply the schema:

   ```bash
   npm run db:setup
   ```

   Or paste `server/schema.sql` into the Neon SQL editor.

### 3. Next.js API on Vercel

The hostable server lives in `server/`. In Vercel, create a project with **Root Directory** set to `server`.

Env vars on Vercel:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon pooled URL |
| `CLERK_SECRET_KEY` | Clerk secret |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

```bash
npm run server
```

Health check: `http://localhost:3000/api/health`

Point the Expo app at it:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

On a phone, localhost will not work — use your LAN IP or the Vercel URL (`https://your-app.vercel.app`).

Copy `.env.example` to `.env` for Expo, and `server/.env.example` to `server/.env.local` for the API.

Sign out from **You** to return to welcome. Signed-in users can tap **Sync now** on that screen.

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

When a newer GitHub Release exists, the installed app shows **Update available**. The user taps **Download update**, installs the APK, and keeps their notes. **You → Check for update** does the same check on demand. A `git push` alone does not update the phone until you publish a new release APK.

### Android — installable APK (Code Red 1.2.3)

**Download:** [CodeRed-1.2.3.apk](https://github.com/akshai78/notes-app/releases/latest/download/CodeRed-1.2.3.apk) from GitHub Releases.

On your phone:

1. Download the APK.
2. Open it and allow **Install from unknown sources** if Android asks.
3. Install **Code Red**.

**EAS cloud APK (use this — local debug APKs have been unreliable):**

On your Mac, in `notes-app` (you are already linked as `akshai78` / project `code-red`):

```bash
git pull origin main
npm install
npx eas login
npx eas build --platform android --profile preview
```

If EAS says **Command must be re-run to pick up new updates configuration**, that first run only installed `expo-updates`. Pull this repo, then run the same `eas build` command **again**. The second run is the real APK.

When Expo asks, confirm the Android package `app.codered.notes`. The build runs in the cloud (~10–20 minutes). Open the URL EAS prints, then **Download** the APK.

Or watch it here: https://expo.dev/accounts/akshai78/projects/code-red/builds

**Build locally (needs Android SDK + Java 17):**

```bash
npm run build:apk:local
```

Output: `releases/CodeRed-1.2.3.apk` (release APK, phone CPUs only — not the old 219MB debug file).

### Why the APK was 219MB

That file was a **debug** build (`assembleDebug`). Debug APKs are for developers, not a notes app you install:

- They embed the React Native / Hermes engine **four times** (32-bit ARM, 64-bit ARM, and two Intel emulator chips).
- They skip R8 minify and resource shrinking, so unused Java and assets stay in the file.
- They keep debug symbols.

Your notes are a few kilobytes. Almost all of the weight is the Expo/React Native runtime, not the feature set.

A **release** APK (EAS preview, or `npm run build:apk:local` now) ships one copy of the engine for 64-bit phones and strips unused code. A local release build of this app is about **33MB**. That is still larger than a tiny Kotlin notes app because Expo always includes JavaScript, Hermes, and native UI libraries. It will not shrink to a few megabytes without leaving Expo.

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
