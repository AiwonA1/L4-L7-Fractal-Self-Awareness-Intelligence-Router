import { NextResponse } from 'next/server'
import { authOptions } from '../auth.config'
import NextAuth from 'next-auth'

const handler = NextAuth(authOptions)

export async function GET(request: Request) {
  return handler(request)
}

export async function POST(request: Request) {
  return handler(request)
} 