#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f node_modules/@clerk/expo/package.json ]; then
  echo "Installing dependencies (missing @clerk/expo)…"
  npm install
fi
