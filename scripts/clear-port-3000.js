import { execSync } from 'child_process';
import { platform } from 'os';

console.log('Checking if port 3000 is in use...');

try {
  if (platform() === 'win32') {
    execSync('netstat -ano | findstr :3000 | findstr LISTENING');
    execSync('for /f "tokens=5" %a in (\'netstat -ano ^| findstr :3000 ^| findstr LISTENING\') do taskkill /F /PID %a');
  } else {
    execSync('lsof -i :3000 | grep LISTEN');
    execSync('lsof -i :3000 | grep LISTEN | awk \'{print $2}\' | xargs kill -9');
  }
} catch (error) {
  // Port is not in use, which is fine
  console.log('Error checking port:', error.message);
}

console.log('Done checking port 3000.'); 