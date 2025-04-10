import fetch from 'node-fetch';

async function waitForServer(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.log(`Waiting for server to start... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

async function runSupabaseTests() {
  console.log('\n=== Starting Supabase Test Suite ===\n');

  try {
    // Check if server is running
    const serverReady = await waitForServer();
    if (!serverReady) {
      throw new Error('Server is not running. Please start the development server with "npm run dev" first.');
    }

    console.log('🔄 Running tests...\n');
    const response = await fetch('http://localhost:3000/api/test-supabase');
    const result = await response.json();

    if (result.success) {
      console.log('✅ All tests passed!\n');
      
      // Format and display results
      const { results } = result;
      console.log('📊 Test Results Summary:');
      console.log('------------------------');
      console.log('🔌 Connection:', results.supabaseConnection.hasSession ? 'Active session' : 'No session');
      console.log('📋 Tables found:', results.tables?.length || 0);
      
      if (results.userData) {
        console.log('\n👤 User Data:');
        console.log('  Email:', results.userData.email);
        console.log('  Name:', results.userData.name);
        console.log('  Token Balance:', results.userData.tokenBalance);
      }

      if (results.chatHistory) {
        console.log('\n💬 Chat History:');
        console.log('  Total Chats:', results.chatHistory.totalChats);
        if (results.chatHistory.testChat) {
          console.log('  Test Chat Created:', !!results.chatHistory.testChat.created);
          console.log('  Test Messages Created:', results.chatHistory.testChat.messages?.length || 0);
          console.log('  Test Chat Deleted:', !!results.chatHistory.testChat.deleted);
        }
      }
    } else {
      console.error('\n❌ Tests failed!');
      console.error('Error:', result.error);
      if (result.errorDetails?.stack) {
        console.error('\nStack trace:');
        console.error(result.errorDetails.stack);
      }
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:');
    console.error(error.message);
  }

  console.log('\n=== Test Suite Complete ===\n');
}

runSupabaseTests(); 