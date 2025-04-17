import nodeFetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://l4-l7-fractal-self-awareness-intelligence-router.vercel.app';
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'Test123!@#',
  name: 'Test User'
};

// Initialize Supabase admin client for cleanup
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSignup() {
  console.log('\n🔍 Starting auth test...');
  console.log('Using base URL:', BASE_URL);
  console.log('Test user email:', TEST_USER.email);

  try {
    // 1. Test environment variables
    console.log('\n📋 Checking environment variables...');
    const envVars = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasNextPublicUrl: !!process.env.NEXT_PUBLIC_URL
    };
    console.log('Environment variables status:', envVars);

    if (!envVars.hasUrl || !envVars.hasAnonKey || !envVars.hasServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // 2. Test direct Supabase connection
    console.log('\n🔌 Testing direct Supabase connection...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
        data: {
          name: TEST_USER.name,
          fract_tokens: 33,
          tokens_used: 0,
          token_balance: 33,
        }
      }
    });

    if (authError) {
      console.error('Direct Supabase auth error:', {
        message: authError.message,
        status: authError.status,
        name: authError.name
      });
      throw new Error(`Direct Supabase auth failed: ${authError.message}`);
    }

    if (!authData?.user) {
      throw new Error('No user data returned from direct Supabase auth');
    }

    console.log('Direct Supabase auth successful:', {
      id: authData.user.id,
      email: authData.user.email,
      hasSession: !!authData.session
    });

    // Clean up the test user from direct test
    console.log('\n🧹 Cleaning up direct test user...');
    const { error: directDeleteError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    if (directDeleteError) {
      console.error('Error deleting direct test user:', directDeleteError);
      throw directDeleteError;
    }
    console.log('Direct test user deleted successfully');

    // 3. Now test the API route
    console.log('\n📝 Testing API route signup...');
    console.log('Request URL:', `${BASE_URL}/api/auth/signup`);
    console.log('Request body:', { ...TEST_USER, password: '[REDACTED]' });
    
    const signupResponse = await nodeFetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_USER)
    });

    let signupData;
    try {
      signupData = await signupResponse.json();
    } catch (e: any) {
      console.error('Error parsing response:', e);
      throw new Error(`Failed to parse response: ${e.message}`);
    }

    console.log('Signup response status:', signupResponse.status);
    console.log('Signup response headers:', Object.fromEntries(signupResponse.headers.entries()));
    console.log('Signup response:', signupData);

    if (!signupResponse.ok) {
      throw new Error(`Signup failed: ${signupData.message || signupData.error || 'Unknown error'}\nStatus: ${signupResponse.status}\nResponse: ${JSON.stringify(signupData, null, 2)}`);
    }

    // 4. Wait a moment for the user to be created
    console.log('\n⏳ Waiting for user creation to complete...');
    await wait(2000);

    // 5. Verify user exists in Supabase
    console.log('\n🔍 Verifying user in Supabase...');
    const { data: users, error: listError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', TEST_USER.email)
      .single();
    
    if (listError) {
      console.error('Error fetching user:', listError);
      throw listError;
    }

    if (!users) {
      throw new Error('User not found in Supabase');
    }

    console.log('User found in Supabase:', {
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.created_at
    });

    // 6. Clean up - Delete test user
    console.log('\n🧹 Cleaning up - Deleting test user...');
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', users.id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw deleteError;
    }

    // Also delete from auth
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(users.id);
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      throw authDeleteError;
    }

    console.log('✅ Test user deleted successfully');
    console.log('\n✨ Auth test completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Test failed:', {
      message: error.message,
      stack: error.stack,
      details: error.details || 'No additional details'
    });
    process.exit(1);
  }
}

// Run the test
testSignup(); 