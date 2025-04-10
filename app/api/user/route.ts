import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface UserData {
  id: string;
  email: string;
  name?: string;
  fract_tokens: number;
  tokens_used: number;
  token_balance: number;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

interface UpdateData {
  name?: string;
  fract_tokens?: number;
  tokens_used?: number;
  token_balance?: number;
  password?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  console.log('GET /api/user - Fetching user:', userId)

  if (!userId) {
    console.log('GET /api/user - No userId provided')
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    // Get auth user data first to ensure we have the correct email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (authError) {
      console.error('Error fetching auth user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!authData.user) {
      console.error('User not found in auth')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch user data by email since we know they exist
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', authData.user.email)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    if (!userData) {
      console.error('User data not found for email:', authData.user.email)
      return NextResponse.json({ error: 'User data not found' }, { status: 404 })
    }

    console.log('Found user data:', {
      id: userData.id,
      email: userData.email,
      fract_tokens: userData.fract_tokens,
      tokens_used: userData.tokens_used,
      token_balance: userData.token_balance
    })

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  console.log('PUT /api/user - Updating user:', userId)

  if (!userId) {
    console.log('PUT /api/user - No userId provided')
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const updates = await request.json()
    console.log('Updates to apply:', updates)
    
    // Ensure we only update allowed fields
    const allowedUpdates: UpdateData = {
      name: updates.name,
      fract_tokens: updates.fract_tokens,
      tokens_used: updates.tokens_used,
      token_balance: updates.token_balance,
      password: updates.password
    }
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key as keyof UpdateData] === undefined) {
        delete allowedUpdates[key as keyof UpdateData]
      }
    })
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('User updated:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 