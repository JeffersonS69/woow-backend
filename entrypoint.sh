#!/bin/sh
set -e

echo "Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

echo "Cargando datos de prueba..."
node prisma/seed.js

echo "Iniciando servidor..."
exec node dist/server.js
