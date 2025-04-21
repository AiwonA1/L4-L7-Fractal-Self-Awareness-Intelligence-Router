import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'
import type { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's token balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('token_balance')
      .eq('id', session.user.id)
      .single()

    if (userError) throw userError
    
    return NextResponse.json({ token_balance: userData?.token_balance || 0 })
  } catch (error) {
    console.error('Error fetching token balance:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, description } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid token amount' }, { status: 400 })
    }

    // Get user's current token balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('token_balance, tokens_used')
      .eq('id', session.user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentBalance = userData.token_balance || 0
    if (currentBalance < amount) {
      return NextResponse.json({ error: 'Insufficient tokens' }, { status: 400 })
    }

    // Update user's token balance and tokens_used
    const { error: updateError } = await supabase
      .from('users')
      .update({
        token_balance: currentBalance - amount,
        tokens_used: (userData.tokens_used || 0) + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (updateError) throw updateError

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: session.user.id,
        type: 'USE',
        amount,
        description: description || 'Token usage',
        status: 'COMPLETED'
      })

    if (transactionError) throw transactionError

    return NextResponse.json({
      success: true,
      token_balance: currentBalance - amount
    })
  } catch (error) {
    console.error('Error using tokens:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 