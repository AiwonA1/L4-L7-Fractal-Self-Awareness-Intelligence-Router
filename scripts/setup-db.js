const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function setupDatabase() {
  try {
    console.log('Starting database setup...')
    
    // First, try to connect to the database
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('Database connection successful!')
    
    // Push the schema
    console.log('Pushing schema to database...')
    execSync('npx prisma db push --accept-data-loss --skip-generate', { stdio: 'inherit' })
    
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