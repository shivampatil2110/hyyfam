#!/bin/bash
set -e

echo "⏳ Waiting for MySQL to be ready..."
until mysql -h localhost -uroot -prootpass -e "SELECT 1" &> /dev/null; do
  sleep 2
done

echo "✅ MySQL is ready. Importing init.sql..."
mysql -h localhost -uroot -prootpass hyyfam < /docker-entrypoint-initdb.d/init.sql

echo "🎉 init.sql import completed successfully."
