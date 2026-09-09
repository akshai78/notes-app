#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -z "${JAVA_HOME:-}" ]; then
  if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
    export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
  fi
fi

if [ -z "${ANDROID_HOME:-}" ]; then
  export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
fi

export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

echo "Generating Android project..."
npx expo prebuild --platform android --no-install

# Debug APKs ship Hermes + RN for every CPU (arm32, arm64, x86, x86_64) and skip R8.
# That is why older local builds were ~219MB. Release + phone ABIs only is the installable app.
echo "Building release APK (arm phones only, minified)..."
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon

OUT="$ROOT/releases/CodeRed-1.2.3.apk"
mkdir -p "$ROOT/releases"
cp app/build/outputs/apk/release/app-release.apk "$OUT"
echo "Done: $OUT ($(du -h "$OUT" | cut -f1))"
