const { execSync } = require('child_process');

console.log('Checking if port 3000 is in use...');

try {
  // Check if port 3000 is in use
  execSync('lsof -i :3000', { stdio: 'ignore' });
  
  // If we get here, port is in use, so kill the process
  console.log('Port 3000 is in use, killing process...');
  execSync('kill -9 $(lsof -t -i:3000)');
} catch (error) {
  // If we get here, port is not in use
  console.log('Port 3000 is not in use');
}

console.log('Done checking port 3000.'); 