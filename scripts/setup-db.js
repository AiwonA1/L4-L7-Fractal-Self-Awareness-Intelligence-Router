const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function waitForConnection(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect()
      console.log('Database connection successful!')
      return true
    } catch (error) {
      console.log(`Connection attempt ${i + 1} failed:`, error.message)
      if (i < retries - 1) {
        console.log(`Waiting ${delay}ms before retrying...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  return false
}

async function setupDatabase() {
  try {
    console.log('Starting database setup...')
    
    // First, try to connect to the database with retries
    console.log('Testing database connection...')
    const connected = await waitForConnection()
    
    if (!connected) {
      throw new Error('Failed to connect to database after multiple attempts')
    }
    
    // Push the schema
    console.log('Pushing schema to database...')
    execSync('npx prisma db push --accept-data-loss --skip-generate', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
        POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL
      }
    })
    
    // Generate Prisma Client
    console.log('Generating Prisma Client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  } finally {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error disconnecting from database:', error)
    }
  }
}

setupDatabase() 