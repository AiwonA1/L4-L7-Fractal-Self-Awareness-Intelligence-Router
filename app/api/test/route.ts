import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  console.log('🔍 [Test API] Testing database connection')
  try {
    // Test database connection
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ [Test API] Database connection successful:', testQuery)

    // Test user table access
    const userCount = await prisma.user.count()
    console.log('👥 [Test API] User count:', userCount)

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      userCount
    })
  } catch (error) {
    console.error('💥 [Test API] Database connection error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 