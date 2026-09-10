# Code Red — todo

Living checklist for the Expo notes app (v1.2.3). Notes save on-device first. Signed-in Clerk users sync through the Next.js API to Neon.

## Now

- [ ] Create the Clerk app, Neon database, and Vercel project (`server/` as Root Directory), then fill Expo `.env` and `server/.env.local`
- [ ] Confirm before empty trash and permanent delete
- [ ] Undo toast after archive or trash

## Product

- [ ] Search archive and trash, not only the home board
- [ ] Filter home notes by tag, and open a tag from a card
- [ ] Auto-purge trash after 30 days
- [ ] Export notes as JSON or Markdown
- [ ] Share a note through the OS share sheet
- [ ] Change password and delete account from **You**
- [ ] Stop editing a signed-in email as if it were a local profile field
- [ ] Attach images to a note
- [ ] Optional reminder on a dated note
- [ ] Dark mode
- [ ] Lock the app with device biometrics

## Ship

- [ ] OTA JS updates through the existing `expo-updates` channel, not only a new APK
- [ ] iOS TestFlight build
- [ ] Google Play AAB (`npm run build:android:store`)
- [ ] Automated tests for storage, date filters, and auth redirects
- [ ] Put Clerk publishable key and `EXPO_PUBLIC_API_URL` into EAS secrets for APK builds

## Done

- [x] Quick capture jot bar and full editor, empty notes discarded
- [x] Folders, tags, checklists, pin, archive, trash
- [x] Calendar day view; notes keep the day they were written
- [x] Phone tabs, tablet grid, desktop sidebar
- [x] Welcome: sign in, create account, guest, show password, forgot password
- [x] Clerk email/password auth (verification code instead of a confirm link)
- [x] Local persist via AsyncStorage
- [x] Local-first last-write-wins sync to Neon through the Vercel-hostable Next.js API
- [x] UUID note and folder ids
- [x] In-app **Update available** from GitHub Releases
- [x] ~33MB arm64 Android release APK
