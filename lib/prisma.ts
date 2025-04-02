import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create a new PrismaClient instance or use the existing one
export const prisma = globalForPrisma.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Add connection pool configuration for better stability
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

// Create a reconnect method to handle connection issues
export const reconnectPrisma = async () => {
  try {
    await prisma.$disconnect()
    await prisma.$connect()
    console.log('Successfully reconnected to the database')
  } catch (error) {
    console.error('Failed to reconnect to the database:', error)
  }
}

// Attach prisma to global object in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma 