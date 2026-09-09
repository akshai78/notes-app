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

echo "Building debug APK (installable on any Android phone)..."
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon

OUT="$ROOT/releases/CodeRed-1.2.2.apk"
mkdir -p "$ROOT/releases"
cp app/build/outputs/apk/debug/app-debug.apk "$OUT"
echo "Done: $OUT"
