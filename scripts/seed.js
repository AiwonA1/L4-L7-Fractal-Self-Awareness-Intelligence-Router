// scripts/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Starting database seed...');

    // Create Paradise Pru user
    const hashedPasswordPru1 = await bcrypt.hash('password123', 12);
    const paradisePru = await prisma.user.upsert({
      where: { email: 'paradisepru@icloud.com' },
      update: {
        tokenBalance: 33
      },
      create: {
        email: 'paradisepru@icloud.com',
        name: 'Paradise Pru',
        password: hashedPasswordPru1,
        tokenBalance: 33,
        emailVerified: new Date()
      }
    });

    // Create Pru user
    const hashedPasswordPru2 = await bcrypt.hash('password123', 12);
    const pru = await prisma.user.upsert({
      where: { email: 'espressolico@gmail.com' },
      update: {
        tokenBalance: 33
      },
      create: {
        email: 'espressolico@gmail.com',
        name: 'Pru',
        password: hashedPasswordPru2,
        tokenBalance: 33,
        emailVerified: new Date()
      }
    });

    console.log('Users seeded successfully!');
    console.log(`Created Paradise Pru with ID: ${paradisePru.id}`);
    console.log(`Created Pru with ID: ${pru.id}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding the database:', error);
    process.exit(1);
  }
}

seed(); 