# woow_backend

REST API con autenticación JWT para gestión de usuarios, construida con Node.js + TypeScript.

## Tabla de contenidos

- [Descripción](#descripción)
- [Prerrequisitos](#prerrequisitos)
- [Instalación](#instalación)
- [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
- [Cómo crear la base de datos](#cómo-crear-la-base-de-datos)
- [Variables de entorno](#variables-de-entorno)
- [Endpoints disponibles](#endpoints-disponibles)
- [Credenciales de prueba](#credenciales-de-prueba)
- [Códigos HTTP](#códigos-http)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## Descripción

API REST que implementa un sistema de autenticación y gestión de usuarios con dos roles: `USER` y `ADMIN`. Incluye registro, login con JWT, visualización y edición de perfil, y listado de usuarios (solo administradores).

**Tecnologías principales:**
- **Node.js + TypeScript** — entorno de ejecución y tipado estático
- **Express.js** — framework HTTP
- **Prisma ORM** — acceso a datos con queries parametrizadas
- **PostgreSQL** — base de datos relacional
- **bcryptjs** — hashing seguro de contraseñas
- **jsonwebtoken** — autenticación con JWT
- **Joi** — validación de esquemas de entrada

---

## Prerrequisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 18.x          |
| npm         | 9.x           |
| PostgreSQL  | 14.x          |

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd woow_backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales (ver sección [Variables de entorno](#variables-de-entorno)).

### 4. Crear la base de datos

```bash
# Opción A: usando psql
psql -U postgres -c "CREATE DATABASE woow_db;"

# Opción B: usando pgAdmin o cualquier cliente SQL
# Ejecutar: CREATE DATABASE woow_db;
```

### 5. Ejecutar las migraciones

```bash
npx prisma migrate dev --name init
```

Esto crea la tabla `users` con el enum `Role` en la base de datos.

### 6. (Opcional) Cargar datos de prueba

```bash
psql -U postgres -d woow_db -f database/seed.sql
```

---

## Cómo ejecutar el proyecto

### Backend

```bash
# Desarrollo (hot-reload)
npm run dev

# Producción
npm run build
npm start
```

El servidor queda disponible en `http://localhost:3001` (o el puerto configurado en `.env`).

### Frontend

> El frontend es un proyecto separado. Ver su propio README para instrucciones de instalación.
> Asegúrate de que el backend esté corriendo antes de iniciar el frontend.

---

## Cómo crear la base de datos

### Método 1: Migraciones de Prisma (recomendado)

```bash
# Crea las tablas automáticamente a partir del schema.prisma
npx prisma migrate dev --name init
```

### Método 2: Script SQL manual

```bash
# Crear esquema
psql -U postgres -d woow_db -f database/schema.sql

# Cargar datos de prueba
psql -U postgres -d woow_db -f database/seed.sql
```

### Método 3: Prisma Studio (interfaz visual)

```bash
npm run prisma:studio
# Abre http://localhost:5555
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/woow_db"
JWT_SECRET=un_secreto_aleatorio_de_al_menos_32_caracteres
JWT_EXPIRES_IN=7d
```

| Variable       | Descripción                             | Valor por defecto |
|----------------|-----------------------------------------|-------------------|
| `PORT`         | Puerto del servidor                     | `3001`            |
| `NODE_ENV`     | Ambiente (`development` / `production`) | `development`     |
| `DATABASE_URL` | Cadena de conexión PostgreSQL           | —                 |
| `JWT_SECRET`   | Clave secreta para firmar JWT (min. 32 chars) | —          |
| `JWT_EXPIRES_IN` | Duración del token JWT               | `7d`              |

---

## Endpoints disponibles

### Autenticación

#### `POST /api/auth/register`

Registra un nuevo usuario con rol `USER`.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "MiPassword123"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "role": "USER",
    "createdAt": "2026-02-28T00:00:00.000Z",
    "updatedAt": "2026-02-28T00:00:00.000Z"
  }
}
```

---

#### `POST /api/auth/login`

Inicia sesión y devuelve un token JWT.

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "MiPassword123"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "role": "USER",
    "createdAt": "2026-02-28T00:00:00.000Z",
    "updatedAt": "2026-02-28T00:00:00.000Z"
  }
}
```

> El token JWT incluye: `userId`, `email`, `role`.

---

#### `GET /api/users/me`

Devuelve el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "role": "USER",
  "createdAt": "2026-02-28T00:00:00.000Z",
  "updatedAt": "2026-02-28T00:00:00.000Z"
}
```

---

#### `PUT /api/users/me`

Actualiza el perfil del usuario autenticado. Todos los campos son opcionales.

**Headers:**
```
Authorization: Bearer <token>
```

**Body (mínimo 1 campo):**
```json
{
  "name": "Juan Actualizado",
  "email": "nuevo@ejemplo.com",
  "password": "NuevoPass123"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Perfil actualizado exitosamente",
  "user": {
    "id": 1,
    "name": "Juan Actualizado",
    "email": "nuevo@ejemplo.com",
    "role": "USER",
    "createdAt": "2026-02-28T00:00:00.000Z",
    "updatedAt": "2026-02-28T01:00:00.000Z"
  }
}
```

---

#### `GET /api/users`

Lista todos los usuarios. **Solo accesible para administradores.**

**Headers:**
```
Authorization: Bearer <token-de-admin>
```

**Respuesta exitosa (200):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Administrador",
      "email": "admin@woow.com",
      "role": "ADMIN",
      "createdAt": "2026-02-28T00:00:00.000Z",
      "updatedAt": "2026-02-28T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### `GET /api/health`

Verificación de estado del servidor (sin autenticación).

**Respuesta (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T00:00:00.000Z"
}
```

---

### Resumen de endpoints

| Método | Ruta                   | Auth       | Rol    | Descripción                    |
|--------|------------------------|------------|--------|--------------------------------|
| POST   | `/api/auth/register`   | No         | —      | Registrar nuevo usuario        |
| POST   | `/api/auth/login`      | No         | —      | Login, retorna JWT             |
| GET    | `/api/users/me`        | Bearer JWT | USER+  | Ver perfil propio              |
| PUT    | `/api/users/me`        | Bearer JWT | USER+  | Actualizar perfil propio       |
| GET    | `/api/users`           | Bearer JWT | ADMIN  | Listar todos los usuarios      |
| GET    | `/api/health`          | No         | —      | Estado del servidor            |

---

### Ejemplos con curl

```bash
# Registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez","email":"juan@ejemplo.com","password":"MiPass123"}'

# Login (guarda el token)
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@ejemplo.com","password":"MiPass123"}' | node -e "process.stdin.resume();process.stdin.setEncoding('utf8');let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))")

# Ver perfil
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Actualizar perfil
curl -X PUT http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Actualizado"}'

# Listar usuarios (requiere token admin)
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Credenciales de prueba

Después de ejecutar `database/seed.sql`:

| Rol   | Email              | Password    |
|-------|--------------------|-------------|
| ADMIN | admin@woow.com     | Admin1234   |
| USER  | user@woow.com      | User1234    |

> Las contraseñas están hasheadas con bcrypt (12 rounds) en la base de datos.

---

## Códigos HTTP

| Código | Cuándo ocurre                                         |
|--------|-------------------------------------------------------|
| 200    | Operación exitosa                                     |
| 201    | Usuario registrado correctamente                      |
| 400    | Datos inválidos, email ya registrado, o email en uso  |
| 401    | Token ausente/inválido/expirado o credenciales malas  |
| 403    | Acceso denegado (se requiere rol ADMIN)               |
| 404    | Usuario no encontrado                                 |
| 500    | Error interno del servidor                            |

---

## Estructura del proyecto

```
woow_backend/
├── database/
│   ├── schema.sql          # Estructura de tablas SQL
│   └── seed.sql            # Datos de prueba
├── prisma/
│   ├── migrations/         # Historial de migraciones
│   └── schema.prisma       # Definición del modelo de datos
├── src/
│   ├── config/
│   │   ├── env.ts          # Validación de variables de entorno (fail-fast)
│   │   └── prisma.ts       # Instancia singleton de PrismaClient
│   ├── controllers/
│   │   ├── auth.controller.ts    # Registro y login
│   │   └── user.controller.ts   # Perfil y listado
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # Verificación de JWT
│   │   ├── admin.middleware.ts   # Guard de rol ADMIN
│   │   └── error.middleware.ts  # Manejador centralizado de errores
│   ├── models/
│   │   └── user.model.ts        # Interfaces y DTOs TypeScript
│   ├── repositories/
│   │   └── user.repository.ts   # Acceso a datos (Prisma, sin passwords)
│   ├── routes/
│   │   ├── auth.routes.ts       # Rutas de autenticación + validación Joi
│   │   ├── user.routes.ts       # Rutas de usuarios + middlewares
│   │   └── index.ts             # Agrupador de rutas
│   ├── services/
│   │   ├── auth.service.ts      # Lógica de registro y login
│   │   └── user.service.ts      # Lógica de perfil y listado
│   └── server.ts                # Entry point
├── .env.example            # Plantilla de variables de entorno
├── package.json
└── tsconfig.json
```

---

## Scripts disponibles

```bash
npm run dev              # Servidor de desarrollo con hot-reload
npm run build            # Compilar TypeScript a dist/
npm start                # Ejecutar versión compilada
npm run prisma:migrate   # Ejecutar migraciones de base de datos
npm run prisma:generate  # Regenerar cliente Prisma
npm run prisma:studio    # Abrir interfaz visual de la BD (puerto 5555)
```
