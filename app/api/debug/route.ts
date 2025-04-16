import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Get cookies from the request
    const cookieStore = cookies()
    const cookieList = cookieStore.getAll()
    const cookieNames = cookieList.map(c => c.name)
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Check if we can connect to the database with a more selective query
    const dbCheck = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        token_balance: true,
        created_at: true
      }
    })
    
    // Get the Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Check Supabase configuration
    const supabaseConfig = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
    }
    
    return NextResponse.json({
      message: "Auth debug information",
      dbConnection: "Connected successfully",
      dbFirstUser: dbCheck,
      sessionExists: !!session,
      session: session,
      supabaseConfig,
      cookieStatus: {
        cookieNames,
        sbSession: cookieStore.get('sb-access-token') ? "Found" : "Not found",
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Debug route error:", error)
    return NextResponse.json({
      message: "Error in debug route",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 