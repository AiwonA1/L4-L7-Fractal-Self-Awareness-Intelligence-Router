import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { amount, userId, currentBalance } = await req.json()

    // Update the user's token balance in Supabase
    const { data: updatedUser, error } = await supabaseAdmin
      .from('profiles')
      .update({ token_balance: currentBalance + amount })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ 
      newBalance: updatedUser.token_balance,
      message: 'Token purchase successful' 
    })
  } catch (error) {
    console.error('Error processing token purchase:', error)
    return NextResponse.json(
      { error: 'Failed to process token purchase' },
      { status: 500 }
    )
  }
} 