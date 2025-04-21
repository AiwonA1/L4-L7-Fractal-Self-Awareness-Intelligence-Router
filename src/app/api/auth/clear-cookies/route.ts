import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Get all cookies
    const cookieStore = cookies()
    const cookieList = cookieStore.getAll()
    
    // Create a response with an empty body
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'All cookies cleared',
        cleared: cookieList.map(c => c.name)
      },
      { status: 200 }
    )
    
    // Clear all session cookies in the response
    for (const cookie of cookieList) {
      response.cookies.delete(cookie.name)
    }
    
    return response
  } catch (error) {
    console.error('Error clearing cookies:', error)
    return NextResponse.json(
      { error: 'Failed to clear cookies' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' // Always run on the server 