const { execSync } = require('child_process');

try {
  console.log('Checking if port 3000 is in use...');
  
  // Different commands for different platforms
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  
  if (isWindows) {
    // Windows
    const output = execSync('netstat -ano | findstr :3000').toString();
    if (output) {
      console.log('Port 3000 is in use. Attempting to kill the process...');
      const lines = output.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[4];
          if (pid) {
            try {
              execSync(`taskkill /F /PID ${pid}`);
              console.log(`Killed process with PID ${pid}`);
            } catch (e) {
              console.error(`Failed to kill process with PID ${pid}:`, e.message);
            }
          }
        }
      }
    } else {
      console.log('Port 3000 is free.');
    }
  } else if (isMac || process.platform === 'linux') {
    // Mac or Linux
    try {
      const output = execSync('lsof -i :3000 | grep LISTEN').toString();
      if (output) {
        console.log('Port 3000 is in use. Attempting to kill the process...');
        const lines = output.split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 1) {
            const pid = parts[1];
            if (pid) {
              try {
                execSync(`kill -9 ${pid}`);
                console.log(`Killed process with PID ${pid}`);
              } catch (e) {
                console.error(`Failed to kill process with PID ${pid}:`, e.message);
              }
            }
          }
        }
      } else {
        console.log('Port 3000 is free.');
      }
    } catch (e) {
      // If the command fails with no output, it means no process is using the port
      if (!e.message.includes('No such file or directory')) {
        console.error('Error checking port:', e.message);
      } else {
        console.log('Port 3000 is free.');
      }
    }
  } else {
    console.log(`Unsupported platform: ${process.platform}`);
  }
  
  console.log('Done checking port 3000.');
} catch (e) {
  console.error('Error:', e.message);
} 