import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Validate environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
}

// Check environment variables
console.log('\n📋 Checking environment variables...')
const envStatus = Object.entries(requiredEnvVars).reduce((acc, [key, value]) => {
  acc[`has${key.split('_').pop()}`] = !!value
  return acc
}, {} as Record<string, boolean>)

console.log('Environment variables status:', envStatus)

if (Object.values(envStatus).some(status => !status)) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Initialize admin client for cleanup
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testAuth() {
  console.log('\n🔍 Starting auth test...')
  
  // Generate test user data
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'Test123!@#'
  const testName = 'Test User'
  
  console.log('Test user email:', testEmail)
  
  try {
    // Test signup
    console.log('\n📝 Testing Supabase signup...')
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          fract_tokens: 33,
          tokens_used: 0,
          token_balance: 33,
        }
      }
    })

    if (signupError) {
      throw new Error(`Signup failed: ${signupError.message}`)
    }

    if (!signupData.user) {
      throw new Error('No user data returned from signup')
    }

    console.log('Signup successful:', {
      id: signupData.user.id,
      email: signupData.user.email,
      hasSession: !!signupData.session
    })

    // Test signin
    console.log('\n🔑 Testing signin...')
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signinError) {
      throw new Error(`Signin failed: ${signinError.message}`)
    }

    if (!signinData.user || !signinData.session) {
      throw new Error('No user or session data returned from signin')
    }

    console.log('Signin successful:', {
      id: signinData.user.id,
      email: signinData.user.email,
      hasSession: !!signinData.session
    })

    // Cleanup: Delete test user
    console.log('\n🧹 Cleaning up test user...')
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      signupData.user.id
    )

    if (deleteError) {
      throw new Error(`Failed to delete test user: ${deleteError.message}`)
    }

    console.log('Test user deleted successfully')
    console.log('\n✅ All tests passed successfully!')

  } catch (error: any) {
    console.error('\n❌ Test failed:', {
      message: error.message,
      stack: error.stack,
      details: error.details || 'No additional details'
    })
    process.exit(1)
  }
}

// Run the test
testAuth() 