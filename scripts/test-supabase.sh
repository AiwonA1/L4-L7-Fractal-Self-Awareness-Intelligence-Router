#!/bin/bash

# Start the development server in the background
echo "🚀 Starting development server..."
npm run dev &

# Wait for the server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Open the test page in the default browser
echo "🌐 Opening test page..."
open http://localhost:3000/test-supabase

# Keep the script running and show logs
echo "📝 Watching test output..."
tail -f .next/server/app/test-supabase/page.js.log

# Keep the script running
wait 