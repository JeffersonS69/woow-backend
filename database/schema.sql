-- =============================================================
-- woow_backend — Schema SQL
-- Equivalente a la migración de Prisma (para referencia o uso manual)
-- =============================================================

-- Crear enum de roles
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- Crear tabla de usuarios
CREATE TABLE "users" (
    "id"        SERIAL          NOT NULL,
    "name"      TEXT            NOT NULL,
    "email"     TEXT            NOT NULL,
    "password"  TEXT            NOT NULL,
    "role"      "Role"          NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Índice único para email (previene duplicados y acelera búsquedas por email)
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Función para actualizar updatedAt automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger que ejecuta la función al actualizar un registro
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
