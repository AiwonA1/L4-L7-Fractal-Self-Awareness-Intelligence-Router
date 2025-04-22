import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'

// Immediate logging when module is loaded
console.log('Auth API Route: Module loaded')
console.log('Auth API Route: Environment check', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
})

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Auth API Route: Missing required environment variables')
  throw new Error('Missing required environment variables')
}

// Force dynamic for auth routes
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
        console.error('Supabase getSession error:', error)
        const status = typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number' ? error.status : 401;
        // Ensure a consistent message for auth errors expected by tests
        return NextResponse.json({ error: 'Authentication error' }, { status }); 
    }
    
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Auth GET Error Caught:', error)
    let status = 500;
    let message = 'Internal server error';

    // Check if the error indicates an authentication issue specifically
    if (error instanceof Error && 
        (error.message.includes('Failed to retrieve session') || 
         error.message.includes('invalid') /* Add other relevant keywords */ )) {
      status = 401;
      message = 'Authentication error'; // Consistent message for tests
    } else if (error instanceof Error) {
        // Keep the specific error message for generic 500 errors if needed for debugging
        // message = error.message; 
        // But tests expect 'Internal server error'
        message = 'Internal server error'; 
    }
    
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { email, password } = await request.json()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
        console.error('Supabase signIn error:', error);
        let errorMessage = 'Invalid credentials';
        let status = 401;
        if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = typeof error.message === 'string' ? error.message : errorMessage;
        }
        if (typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number') {
            status = error.status;
            if (status !== 401 && status !== 400) { 
                 errorMessage = 'Authentication failed'; 
            } else if (status === 400) { // Supabase often uses 400 for invalid credentials
                errorMessage = 'Invalid credentials'; 
                status = 401; // Return 401 as per test expectation
            }
        } else {
            status = 401;
            errorMessage = 'Invalid credentials'; // Ensure consistent msg for tests
        }
        return NextResponse.json({ error: errorMessage }, { status });
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Auth POST Error Caught:', error)
    let status = 500;
    let message = 'Internal server error';

    // Check if the error indicates invalid credentials specifically
    if (error instanceof Error && 
        (error.message.includes('Invalid login credentials') || 
         error.message.includes('invalid') /* Add other keywords */)) {
      status = 401;
      message = 'Invalid credentials'; // Consistent message for tests
    } else if (error instanceof Error) {
        // Keep specific message for debugging if needed, but tests expect generic
        // message = error.message; 
        message = 'Internal server error';
    }
    
    return NextResponse.json({ error: message }, { status })
  }
} 