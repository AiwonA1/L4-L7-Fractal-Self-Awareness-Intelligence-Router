import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('Starting database setup...')
    
    // Push the schema
    console.log('Pushing schema to database...')
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
    
    // Generate Prisma Client
    console.log('Generating Prisma Client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase() 