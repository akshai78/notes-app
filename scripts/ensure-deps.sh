#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f node_modules/@supabase/supabase-js/package.json ]; then
  echo "Installing dependencies (missing @supabase/supabase-js)…"
  npm install
fi
