import { PrismaClient } from '@prisma/client'
import { Pool } from '@vercel/postgres'

// PrismaClient singleton instance
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // In development, use a global variable to keep the connection alive
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient
  }
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient()
  }
  prisma = globalWithPrisma.prisma
}

// Setup Vercel Postgres connection pool for direct SQL queries if needed
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// For direct SQL queries when Prisma is not the best fit
export async function executeQuery(text: string, params: any[] = []) {
  try {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Error executing query', error)
    throw error
  }
}

export default prisma 