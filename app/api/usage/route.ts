import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient()
  
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

    // Get user's usage data
    const { data: userData, error: usageError } = await supabase
      .from('users')
      .select('token_balance, tokens_used')
      .eq('id', user.id)
      .single()

    if (usageError) {
      throw usageError
    }

    // Get user's transactions
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (transactionError) {
      throw transactionError
    }

    return NextResponse.json({
      usage: {
        tokenBalance: userData?.token_balance || 0,
        tokensUsed: userData?.tokens_used || 0,
        recentTransactions: transactions || []
      }
    })
  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 