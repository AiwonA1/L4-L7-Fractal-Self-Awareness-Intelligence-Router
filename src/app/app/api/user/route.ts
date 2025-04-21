import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

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

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient()
    
    const body = await req.json()
    const { userId, ...updates } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 