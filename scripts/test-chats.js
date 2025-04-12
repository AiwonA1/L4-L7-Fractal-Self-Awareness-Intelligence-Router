import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { platform } from 'os';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Start the development server
console.log('Starting development server...');

// Start the Next.js dev server
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: projectRoot
});

// Give the server some time to start up
console.log('Waiting for server to start...');
await new Promise(resolve => setTimeout(resolve, 5000));

console.log('\nTesting chats endpoint...');
try {
  const response = await fetch('http://localhost:3000/api/test-chats');
  const data = await response.json();
  console.log('\nChats in database:');
  console.log(JSON.stringify(data, null, 2));
} catch (error) {
  console.error('Error testing chats endpoint:', error);
}

// Kill the dev server
if (platform() === 'win32') {
  spawn('taskkill', ['/pid', devServer.pid, '/f', '/t']);
} else {
  process.kill(-devServer.pid);
}

process.exit(0); 