#!/bin/sh
set -e

if [ -f "scripts/migrate-and-seed.mjs" ]; then
  node scripts/migrate-and-seed.mjs
fi

exec "$@"
