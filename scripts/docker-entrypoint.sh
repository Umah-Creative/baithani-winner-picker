#!/bin/sh
set -e

if [ -f "src/db/migrate.mjs" ]; then
  node src/db/migrate.mjs
fi

if [ -f "src/db/seeders/run.mjs" ]; then
  node src/db/seeders/run.mjs
fi

exec "$@"
