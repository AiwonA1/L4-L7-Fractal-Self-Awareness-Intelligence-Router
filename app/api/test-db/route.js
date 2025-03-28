import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  console.log('📥 [API] GET /api/test-db')
  try {
    // Test database connection
    const users = await prisma.user.findMany({
      take: 1
    })
    
    console.log('✅ [API] Database connection successful')
    return NextResponse.json({ success: true, message: 'Database connection successful', count: users.length })
  } catch (error) {
    console.error('💥 [API] Database connection error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to connect to database' },
      { status: 500 }
    )
  }
} 