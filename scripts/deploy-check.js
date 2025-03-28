#!/usr/bin/env node

/**
 * Pre-deployment check script
 * Verifies that all necessary environment variables are set
 * and services are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { createRequire } from 'module';

// Initialize dotenv
dotenv.config();

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

console.log(`${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║   FractiVerse Router Pre-Deployment Check   ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}`);
console.log();

// Required environment variables
const requiredEnvVars = [
  { name: 'NEXT_PUBLIC_URL', description: 'Public URL of the application' },
  { name: 'DATABASE_URL', description: 'PostgreSQL connection string' },
  { name: 'NEXTAUTH_URL', description: 'URL for NextAuth.js' },
  { name: 'NEXTAUTH_SECRET', description: 'Secret for NextAuth.js' },
  { name: 'STRIPE_SECRET_KEY', description: 'Stripe secret API key' },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', description: 'Stripe publishable API key' },
  { name: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook signing secret' },
  { name: 'OPENAI_API_KEY', description: 'OpenAI API key' }
];

// File checks
const requiredFiles = [
  { path: 'prisma/schema.prisma', description: 'Prisma schema file' },
  { path: 'app/api/stripe/webhook/route.ts', description: 'Stripe webhook handler' },
  { path: 'app/api/stripe/create-payment-intent/route.ts', description: 'Stripe payment intent handler' },
  { path: 'app/components/StripeProvider.tsx', description: 'Stripe provider component' },
  { path: 'app/components/StripeCheckoutForm.tsx', description: 'Stripe checkout form component' },
  { path: 'app/components/TokenBalanceModal.tsx', description: 'Token balance modal component' }
];

// Check environment variables
console.log(`${colors.blue}Checking environment variables...${colors.reset}`);
let envErrors = 0;

requiredEnvVars.forEach(({ name, description }) => {
  const value = process.env[name];
  if (!value) {
    console.log(`${colors.red}✖ Missing: ${name} - ${description}${colors.reset}`);
    envErrors++;
  } else {
    const maskedValue = name.includes('SECRET') || name.includes('KEY') 
      ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
      : value;
    console.log(`${colors.green}✓ ${name}: ${maskedValue}${colors.reset}`);
  }
});

console.log();

// Check required files
console.log(`${colors.blue}Checking required files...${colors.reset}`);
let fileErrors = 0;

requiredFiles.forEach(({ path: filePath, description }) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`${colors.green}✓ ${filePath}${colors.reset}`);
  } else {
    console.log(`${colors.red}✖ Missing: ${filePath} - ${description}${colors.reset}`);
    fileErrors++;
  }
});

console.log();

// Check package.json for required dependencies
console.log(`${colors.blue}Checking package.json dependencies...${colors.reset}`);
let packageErrors = 0;

const requiredDependencies = [
  '@stripe/react-stripe-js',
  '@stripe/stripe-js',
  'stripe',
  'next-auth',
  '@vercel/postgres',
  '@prisma/client'
];

try {
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const dependencies = { ...packageJson.dependencies };
  
  requiredDependencies.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`${colors.green}✓ ${dep}: ${dependencies[dep]}${colors.reset}`);
    } else {
      console.log(`${colors.red}✖ Missing dependency: ${dep}${colors.reset}`);
      packageErrors++;
    }
  });
} catch (error) {
  console.log(`${colors.red}✖ Error reading package.json: ${error.message}${colors.reset}`);
  packageErrors++;
}

console.log();

// Summary
const totalErrors = envErrors + fileErrors + packageErrors;
if (totalErrors === 0) {
  console.log(`${colors.green}✓ All checks passed! Your application is ready for deployment.${colors.reset}`);
} else {
  console.log(`${colors.red}✖ Found ${totalErrors} issues that need to be fixed before deployment:${colors.reset}`);
  if (envErrors > 0) console.log(`${colors.yellow}  - ${envErrors} environment variable issues${colors.reset}`);
  if (fileErrors > 0) console.log(`${colors.yellow}  - ${fileErrors} file issues${colors.reset}`);
  if (packageErrors > 0) console.log(`${colors.yellow}  - ${packageErrors} package dependency issues${colors.reset}`);
  process.exit(1);
}

console.log();
console.log(`${colors.cyan}Run the following command to deploy to Vercel:${colors.reset}`);
console.log(`${colors.magenta}vercel${colors.reset}`); 