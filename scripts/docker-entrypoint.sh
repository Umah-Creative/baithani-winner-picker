#!/bin/sh
set -e

if [ -f "src/db/migrate.mjs" ]; then
  node src/db/migrate.mjs
fi

exec "$@"
