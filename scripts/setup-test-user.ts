import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Using service role key to create user
)

async function setupTestUser() {
  const testUser = {
    email: 'test@fractiverse.com',
    password: 'TestUser123!',
    user_metadata: {
      name: 'Test User',
      role: 'tester'
    }
  }

  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', testUser.email)
      .single()

    if (!existingUser) {
      // Create new user
      const { data, error } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: testUser.user_metadata
      })

      if (error) throw error

      console.log('Test user created:', data.user)
    } else {
      console.log('Test user already exists')
    }

    // Test authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    })

    if (authError) throw authError

    console.log('Test user authenticated successfully')
    console.log('Access token:', authData.session?.access_token)

    // Update .env.test with the token
    // Note: In practice, you might want to handle this differently
    console.log('\nAdd these lines to your .env.test:')
    console.log(`TEST_USER_EMAIL=${testUser.email}`)
    console.log(`TEST_USER_PASSWORD=${testUser.password}`)
  } catch (error) {
    console.error('Error setting up test user:', error)
    process.exit(1)
  }
}

setupTestUser() 