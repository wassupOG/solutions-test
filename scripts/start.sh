#!/bin/sh
set -eu

# Never reset/push the schema. Apply only reviewed, committed migrations.
./node_modules/.bin/prisma migrate deploy
node dist/database/seed.js
exec node dist/main.js
