import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { platform } from 'os';

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

console.log('\nRunning Supabase tests...');
const testProcess = spawn('npm', ['run', 'test-supabase'], {
  stdio: 'inherit',
  shell: true,
  cwd: projectRoot
});

// Handle test completion
testProcess.on('close', (code) => {
  console.log(`\nTests completed with code ${code}`);
  // Kill the dev server after tests complete
  if (platform() === 'win32') {
    spawn('taskkill', ['/pid', devServer.pid, '/f', '/t']);
  } else {
    process.kill(-devServer.pid);
  }
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  devServer.kill();
  process.exit();
}); 