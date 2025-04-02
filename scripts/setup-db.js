const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🔄 Starting database setup...')

    // Check database connection
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Run migrations
    const { execSync } = require('child_process')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    console.log('✅ Migrations applied successfully')

    // Create initial admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fractiverse.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: 'Admin',
        password: adminPassword, // In production, this should be hashed
        tokenBalance: 1000,
        emailVerified: new Date(),
        preferences: {
          isAdmin: true,
          theme: 'dark'
        }
      }
    })

    console.log('✅ Admin user created/updated:', admin.id)

    // Create test user if in development
    if (process.env.NODE_ENV === 'development') {
      const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'test123', // In production, this should be hashed
          tokenBalance: 100,
          emailVerified: new Date(),
          preferences: {
            theme: 'light'
          }
        }
      })

      console.log('✅ Test user created/updated:', testUser.id)
    }

    console.log('✨ Database setup completed successfully!')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase() 