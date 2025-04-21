import prisma from '@/lib/prisma'

export default async function handler(req, res) {
  try {
    // Test database connection
    const users = await prisma.user.findMany({
      take: 1
    })
    
    return { success: true, users }
  } catch (error) {
    console.error('Database connection error:', error)
    return { success: false, error: error.message }
  }
} 