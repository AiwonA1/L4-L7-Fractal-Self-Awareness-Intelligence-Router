import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/serverClient'
import type { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: { session }, error: sessionError } = await serverClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: transactions, error: transactionError } = await serverClient
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (transactionError) throw transactionError
    
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { data: { session }, error: sessionError } = await serverClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, description } = body

    const { data: transaction, error: transactionError } = await serverClient
      .from('transactions')
      .insert({
        user_id: session.user.id,
        type,
        amount,
        description,
        status: 'COMPLETED'
      })
      .select()
      .single()

    if (transactionError) throw transactionError
    
    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 