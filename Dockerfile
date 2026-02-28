# =============================================================
# Stage 1: builder
# Compila TypeScript y genera el cliente de Prisma
# =============================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias y schema de Prisma primero
# (aprovecha el cache de capas de Docker si no cambian)
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias (incluyendo devDeps para compilar)
RUN npm ci

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar código fuente y compilar
COPY src ./src/
RUN npm run build

# =============================================================
# Stage 2: production
# Imagen final ligera, solo con lo necesario para ejecutar
# =============================================================
FROM node:18-alpine AS production

WORKDIR /app

# Copiar manifiestos para instalar solo dependencias de producción
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar artefactos del stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma/

# Copiar script de entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

CMD ["sh", "entrypoint.sh"]
