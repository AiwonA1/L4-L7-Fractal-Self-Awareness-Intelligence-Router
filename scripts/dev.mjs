import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let nextDev = null;

async function openBrowser() {
  try {
    if (process.platform === 'darwin') {
      await execAsync('open http://localhost:3000');
    } else if (process.platform === 'win32') {
      await execAsync('start http://localhost:3000');
    } else {
      await execAsync('xdg-open http://localhost:3000');
    }
    console.log('Browser opened successfully');
  } catch (error) {
    console.error('Failed to open browser:', error);
  }
}

async function startServer() {
  // Kill any existing Next.js processes
  try {
    if (process.platform === 'win32') {
      await execAsync('taskkill /F /IM node.exe');
    } else {
      await execAsync('pkill -f "next dev"');
    }
  } catch (error) {
    // Ignore errors if no processes were found
  }

  // Start Next.js server
  nextDev = spawn('next', ['dev'], {
    stdio: 'pipe',
    shell: true
  });

  // Handle server output
  nextDev.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    // When the server is ready, open the browser
    if (output.includes('Ready in')) {
      console.log('Server is ready, opening browser...');
      // Add a small delay to ensure the server is fully ready
      setTimeout(openBrowser, 2000);
    }
  });

  nextDev.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  // Handle process termination
  process.on('SIGINT', () => {
    if (nextDev) {
      nextDev.kill();
    }
    process.exit();
  });
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 