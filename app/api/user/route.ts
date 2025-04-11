import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase-admin'

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

  console.log('GET /api/user - Fetching user by ID:', userId)

  if (!userId) {
    console.log('GET /api/user - No userId provided')
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    // First get the user's email from auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (authError || !user) {
      console.error('Error fetching auth user:', authError)
      return NextResponse.json({ error: 'User not found in auth' }, { status: 404 })
    }

    console.log('Found auth user with email:', user.email)

    // Get user data by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // Create new user record
      const newUser = {
        id: userId, // Use the new auth ID
        email: user.email,
        name: user.user_metadata?.name || null,
        fract_tokens: 0,
        tokens_used: 0,
        token_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([newUser])
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      console.log('Created new user:', createdUser)
      return NextResponse.json(createdUser)
    }

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Update the user ID if it's different
    if (userData.id !== userId) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ id: userId, updated_at: new Date().toISOString() })
        .eq('email', user.email)

      if (updateError) {
        console.error('Error updating user ID:', updateError)
        // Continue anyway since we have the user data
      } else {
        console.log('Updated user ID from', userData.id, 'to', userId)
        userData.id = userId
      }
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