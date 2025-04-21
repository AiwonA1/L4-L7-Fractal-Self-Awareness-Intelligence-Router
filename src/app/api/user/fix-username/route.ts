import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)
  
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('sb-access-token')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionCookie)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('name', username)
      .not('id', 'eq', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw checkError
    }

    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    // Update username
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ name: username })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error fixing username:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 