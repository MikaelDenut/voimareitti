#!/usr/bin/env bash
# Voimareitti regression gate. Green = safe to proceed.
# No deploy here - shipping is a separate, explicit step (CLAUDE.md Hard Rule 17).
set -euo pipefail
cd "$(dirname "$0")"

echo "==> svelte-check"
npm run check

echo "==> tests"
npm run test

echo "==> build"
npm run build

echo "GATE GREEN"
