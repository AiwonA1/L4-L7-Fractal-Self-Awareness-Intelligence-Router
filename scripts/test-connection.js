const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version();`;
    console.log('Connection successful:', result);
    
    const userCount = await prisma.user.count();
    console.log('Number of users:', userCount);
    
    const chatCount = await prisma.chat.count();
    console.log('Number of chats:', chatCount);
    
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 