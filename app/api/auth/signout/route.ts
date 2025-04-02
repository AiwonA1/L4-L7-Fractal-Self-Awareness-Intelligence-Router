import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Delete the session cookie
  cookies().delete('auth-token')

  return NextResponse.json({ message: 'Signed out successfully' })
} 