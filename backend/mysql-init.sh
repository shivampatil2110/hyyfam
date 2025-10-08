#!/bin/bash
set -e

echo "🚀 Starting MySQL..."
docker-entrypoint.sh mysqld &

# Wait for MySQL to become ready
echo "⏳ Waiting for MySQL to start..."
until mysqladmin ping -h"localhost" -uroot -prootpass --silent; do
  sleep 2
done

echo "✅ MySQL started. Importing init.sql if needed..."

# Check if a sample table exists; if not, import init.sql
if ! mysql -uroot -prootpass -e "USE hyyfam; SHOW TABLES LIKE 'activity_code_master';" | grep -q activity_code_master; then
  echo "📥 Importing init.sql..."
  mysql -uroot -prootpass hyyfam < /docker-entrypoint-initdb.d/init.sql
  echo "🎉 init.sql imported successfully!"
else
  echo "⚡ Tables already exist. Skipping import."
fi

wait
