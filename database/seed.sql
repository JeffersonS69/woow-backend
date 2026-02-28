-- =============================================================
-- woow_backend — Seed SQL
-- Datos de prueba: 1 administrador + 1 usuario normal
--
-- Credenciales:
--   admin@woow.com  →  Admin1234
--   user@woow.com   →  User1234
--
-- Hashes generados con bcrypt (12 rounds)
-- =============================================================

INSERT INTO "users" ("name", "email", "password", "role", "createdAt", "updatedAt")
VALUES
  (
    'Administrador',
    'admin@woow.com',
    '$2a$12$6Y1wNzwJ7scW2vZsEaX7gecULe.M1U4ZPMmjFSrWZSd/Jnhcduntu',
    'ADMIN',
    NOW(),
    NOW()
  ),
  (
    'Usuario de Prueba',
    'user@woow.com',
    '$2a$12$OvG/XXnlajV0o6G.ZhZPeOSt5jHCTpU0cB0asK48gKnvDEh/ImqNm',
    'USER',
    NOW(),
    NOW()
  )
ON CONFLICT ("email") DO NOTHING;
