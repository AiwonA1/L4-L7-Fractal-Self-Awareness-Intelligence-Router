import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all users from the database
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')

    if (usersError) {
      console.error('Users fetch error:', usersError)
      return NextResponse.json({ 
        status: 'error',
        message: 'Failed to fetch users',
        error: usersError
      }, { status: 500 })
    }

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session test error:', sessionError)
      return NextResponse.json({ 
        status: 'error',
        message: 'Session check failed',
        error: sessionError
      }, { status: 500 })
    }

    // Get current auth user if session exists
    let authUser = null
    if (session?.user?.id) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!authError) {
        authUser = user
      }
    }

    return NextResponse.json({
      status: 'success',
      database: {
        usersCount: allUsers.length,
        users: allUsers
      },
      auth: {
        hasSession: !!session,
        session: session,
        currentUser: authUser
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      status: 'error',
      message: 'Auth test failed',
      error: error
    }, { status: 500 })
  }
} 