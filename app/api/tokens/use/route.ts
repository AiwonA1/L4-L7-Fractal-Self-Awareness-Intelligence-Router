import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { userId, amount, description } = await req.json()

    if (!userId || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current token balance
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('token_balance')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // Check if user has enough tokens
    if (userData.token_balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient tokens' },
        { status: 400 }
      )
    }

    // Update token balance
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        token_balance: userData.token_balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating token balance:', updateError)
      return NextResponse.json(
        { error: 'Failed to update token balance' },
        { status: 500 }
      )
    }

    // Record transaction
    const { error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'USE',
        amount: amount,
        description: description,
        status: 'COMPLETED'
      })

    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
      // Don't return error here as the token deduction was successful
    }

    return NextResponse.json({
      success: true,
      newBalance: userData.token_balance - amount
    })
  } catch (error) {
    console.error('Error in token deduction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 