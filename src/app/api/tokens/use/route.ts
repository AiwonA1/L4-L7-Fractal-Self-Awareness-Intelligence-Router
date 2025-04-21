import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/supabase-admin'
import { headers } from 'next/headers' // Import headers
import { rateLimitCheck } from '@/lib/rate-limit' // Import rate limiting

// Basic security check: Allow only requests from localhost or internal Vercel IPs
// This is NOT foolproof security, proper service-to-service auth is better.
function isAllowedCaller(req: Request): boolean {
  const allowedHosts = ['localhost', '127.0.0.1', '::1'];
  const vercelForwardedFor = headers().get('x-vercel-forwarded-for'); // Check Vercel header
  const host = headers().get('host')?.split(':')[0]; // Get hostname part

  // Allow if Vercel internal call or localhost
  // Explicitly cast results to boolean using !! to satisfy type checker
  return (!!vercelForwardedFor?.startsWith('::ffff:') || // Internal Vercel IPv6
          !!(host && allowedHosts.includes(host)));
}

export async function POST(req: NextRequest) {
  // --- Security Check ---
  if (process.env.NODE_ENV === 'production' && !isAllowedCaller(req)) {
      console.warn('Blocked unauthorized call to /api/tokens/use');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // --- End Security Check ---

  try {
    const { userId, amount, description } = await req.json()

    // --- Rate Limiting (User ID from body) ---
    // Apply *after* basic validation but before DB call
    if (userId) { // Only apply if userId is present
        const { success: limitReached } = await rateLimitCheck(userId, 'api');
        if (!limitReached) {
            return NextResponse.json({ error: 'Too many requests for this user' }, { status: 429 });
        }
    }
    // --- End Rate Limiting ---

    if (!userId || typeof amount !== 'number' || amount <= 0 || !description) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields (userId, amount > 0, description)' },
        { status: 400 }
      )
    }

    // Call the database function to handle token deduction atomically
    // Cast the result data to boolean as the RPC function should return boolean
    const { data: successData, error: rpcError } = await supabaseAdmin.rpc('use_tokens', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
    })
    const success = successData as boolean;

    if (rpcError) {
      console.error(`Error calling use_tokens RPC for user ${userId}:`, rpcError)
      // Check for specific error messages if needed (e.g., insufficient funds from DB function)
       if (rpcError.message.includes('Insufficient tokens')) { // Example check
           return NextResponse.json({ error: 'Insufficient tokens' }, { status: 400 })
       }
      return NextResponse.json(
        { error: 'Failed to process token usage' },
        { status: 500 }
      )
    }

    if (!success) {
       // The RPC function returned false, likely indicating insufficient balance
       // (assuming the function is designed this way)
       return NextResponse.json({ error: 'Insufficient tokens' }, { status: 400 })
    }

    // RPC function handled balance update and transaction logging
    return NextResponse.json({
      success: true,
      // We don't know the new balance here unless the RPC returns it
      message: `${amount} tokens deducted successfully.`
    })

  } catch (error) {
    console.error('Error in token usage endpoint:', error)
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 }
    )
  }
} 