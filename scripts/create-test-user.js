// scripts/create-test-user.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    // Hash the password
    const password = await bcrypt.hash('password123', 10)
    
    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: { 
        name: 'Test User',
        password: password,
        tokenBalance: 100
      },
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: password,
        tokenBalance: 100
      }
    })
    
    console.log('Test user created successfully:', user)
    
    // Create a test chat for the user
    const chat = await prisma.chat.create({
      data: {
        title: 'Test Chat',
        userId: user.id,
        messages: {
          create: [
            {
              role: 'system',
              content: 'Welcome to FractiVerse Router. How can I assist you today?'
            },
            {
              role: 'user',
              content: 'Hello! This is a test message.'
            },
            {
              role: 'assistant',
              content: 'Hi! I am the FractiVerse Router. This is a test response.'
            }
          ]
        }
      }
    })
    
    console.log('Test chat created successfully:', chat)
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log('Script completed successfully.'))
  .catch(e => {
    console.error('Script failed:', e)
    process.exit(1)
  }) 