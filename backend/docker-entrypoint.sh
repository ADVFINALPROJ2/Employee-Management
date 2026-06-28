#!/bin/sh
set -e

echo "Checking database connectivity and applying Prisma migrations..."
npx prisma db push --accept-data-loss || npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed

echo "Database layer synchronized. Booting NestJS Application Server..."
exec "$@"
