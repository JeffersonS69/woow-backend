'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash('Admin1234', 12),
    bcrypt.hash('User1234', 12),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@woow.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@woow.com',
      password: adminHash,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@woow.com' },
    update: {},
    create: {
      name: 'Usuario de Prueba',
      email: 'user@woow.com',
      password: userHash,
      role: 'USER',
    },
  });

  console.log(`Seed completado: ${admin.email} (${admin.role}), ${user.email} (${user.role})`);
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
