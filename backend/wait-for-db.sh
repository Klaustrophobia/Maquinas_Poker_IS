#!/bin/bash
# wait-for-db.sh

set -e

# Usar variables de entorno con valores por defecto
host="${DB_HOST:-db}"
user="${DB_USER:-postgres}"
password="${DB_PASS:-oracle}"
database="${DB_NAME:-Maquinas_Poker}"
cmd="$@"

echo "Esperando a que la base de datos en $host esté lista..."

until PGPASSWORD="$password" psql -h "$host" -U "$user" -d "$database" -c '\q' > /dev/null 2>&1; do
  echo "La base de datos no está disponible - esperando..."
  sleep 2
done

echo "✅ Base de datos lista, iniciando aplicación..."
exec $cmd