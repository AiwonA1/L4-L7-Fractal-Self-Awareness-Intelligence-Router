"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Create test users
    const hashedPassword = await (0, bcryptjs_1.hash)('password123', 12);
    const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            name: 'Test User',
            password: hashedPassword,
            tokenBalance: 100,
            emailVerified: new Date(),
            bio: 'This is a test user account',
            preferences: {
                theme: 'light',
                notifications: true
            }
        },
    });
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            tokenBalance: 1000,
            emailVerified: new Date(),
            bio: 'This is an admin account',
            preferences: {
                theme: 'dark',
                notifications: true,
                isAdmin: true
            }
        },
    });
    console.log('✅ Users created:', {
        testUser: testUser.id,
        adminUser: adminUser.id
    });
    // Create a test chat first
    const testChat = await prisma.chat.create({
        data: {
            title: 'Test Chat',
            userId: testUser.id,
        }
    });
    console.log('✅ Test chat created:', testChat.id);
    // Now create messages linked to the chat
    await prisma.message.createMany({
        data: [
            {
                chatId: testChat.id,
                role: 'user',
                content: 'Hello, this is a test message'
            },
            {
                chatId: testChat.id,
                role: 'assistant',
                content: 'Hi! I am the AI assistant. How can I help you today?'
            }
        ]
    });
    console.log('✅ Messages created for test chat');
    // Create some test transactions
    const purchaseTransaction = await prisma.transaction.create({
        data: {
            userId: testUser.id,
            type: 'PURCHASE',
            amount: 1000,
            status: 'COMPLETED',
            description: 'Purchase of 100 tokens'
        }
    });
    const usageTransaction = await prisma.transaction.create({
        data: {
            userId: testUser.id,
            type: 'USE',
            amount: 10,
            status: 'COMPLETED',
            description: 'Token usage for chat'
        }
    });
    console.log('✅ Test transactions created:', {
        purchase: purchaseTransaction.id,
        usage: usageTransaction.id
    });
    console.log('✨ Database seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
