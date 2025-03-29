# FractiVerse 1.0: L4-L7 Fractal Self-Awareness Intelligence Router

A powerful AI-driven router with built-in token balance system, allowing users to interact with advanced language models while managing their token usage.

## Features

- **User Authentication**: Secure login with email/password via NextAuth.js
- **Token System**: Purchase and manage FractiTokens for AI router access
- **Secure Payments**: Integrated Stripe for secure payment processing with tax handling
- **Chat Interface**: Clean, intuitive interface for interacting with AI
- **Token Usage Tracking**: Monitor usage per chat session
- **Responsive Design**: Works seamlessly across devices

## Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/L4-L7-Fractal-Self-Awareness-Intelligence-Router.git
cd L4-L7-Fractal-Self-Awareness-Intelligence-Router

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

## Deployment on Vercel

### 1. Configure Environment Variables

When setting up your Vercel project, add these environment variables:

```
# App
NEXT_PUBLIC_URL=https://your-vercel-domain.vercel.app

# Database
DATABASE_URL=your_vercel_postgres_connection_string

# NextAuth
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=generate_a_new_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_test_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 2. Set Up Vercel Postgres Database

1. In the Vercel dashboard, go to **Storage**
2. Click **Create Database** and select **Postgres**
3. Follow the setup wizard to create your database
4. After creation, go to the database settings to find your connection string
5. Copy the connection string and add it as `DATABASE_URL` in your environment variables

### 3. Deploy Your Application

1. Push your code to GitHub if you haven't already
2. In the Vercel dashboard, click **Add New Project**
3. Select your GitHub repository
4. Configure the project:
   - Framework preset: Next.js
   - Build command: `npm run vercel-build` (ensures Prisma migrations run)
   - Root directory: Leave as default (usually /)
5. Add all environment variables from step 1
6. Click **Deploy**

### 4. Set Up Stripe Webhooks

1. Login to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Developers** > **Webhooks**
3. Click **Add Endpoint**
4. Enter your webhook URL:
   ```
   https://your-vercel-domain.vercel.app/api/stripe/webhook
   ```
5. Select these events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Click **Add Endpoint**
7. On the webhook details page, reveal the signing secret
8. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET` in your Vercel environment variables

## Testing

You can run pre-deployment checks with our utility script:

```bash
node scripts/deploy-check.js
```

For testing Stripe webhooks locally:

```bash
./scripts/stripe-webhook-test.sh
```

## Tech Stack

- **Frontend**: Next.js, React, Chakra UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Vercel Postgres)
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **AI Integration**: OpenAI API

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Project Phase

Currently in initial release phase with focus on core functionality. Upcoming features include subscription options, team accounts, and expanded AI model selection.

# FractiVerse Router

A powerful AI-driven router with built-in token balance system, allowing users to interact with advanced language models while managing their token usage.

## Features

- **User Authentication**: Secure login with email/password via NextAuth.js
- **Token System**: Purchase and manage FractiTokens for AI router access
- **Secure Payments**: Integrated Stripe for secure payment processing with tax handling
- **Chat Interface**: Clean, intuitive interface for interacting with AI
- **Token Usage Tracking**: Monitor usage per chat session
- **Responsive Design**: Works seamlessly across devices

## Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/L4-L7-Fractal-Self-Awareness-Intelligence-Router.git
cd L4-L7-Fractal-Self-Awareness-Intelligence-Router

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

## Deployment on Vercel

### 1. Configure Environment Variables

When setting up your Vercel project, add these environment variables:

```
# App
NEXT_PUBLIC_URL=https://your-vercel-domain.vercel.app

# Database
DATABASE_URL=your_vercel_postgres_connection_string

# NextAuth
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=generate_a_new_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_test_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 2. Set Up Vercel Postgres Database

1. In the Vercel dashboard, go to **Storage**
2. Click **Create Database** and select **Postgres**
3. Follow the setup wizard to create your database
4. After creation, go to the database settings to find your connection string
5. Copy the connection string and add it as `DATABASE_URL` in your environment variables

### 3. Deploy Your Application

1. Push your code to GitHub if you haven't already
2. In the Vercel dashboard, click **Add New Project**
3. Select your GitHub repository
4. Configure the project:
   - Framework preset: Next.js
   - Build command: `npm run vercel-build` (ensures Prisma migrations run)
   - Root directory: Leave as default (usually /)
5. Add all environment variables from step 1
6. Click **Deploy**

### 4. Set Up Stripe Webhooks

1. Login to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Developers** > **Webhooks**
3. Click **Add Endpoint**
4. Enter your webhook URL:
   ```
   https://your-vercel-domain.vercel.app/api/stripe/webhook
   ```
5. Select these events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Click **Add Endpoint**
7. On the webhook details page, reveal the signing secret
8. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET` in your Vercel environment variables

## Testing

You can run pre-deployment checks with our utility script:

```bash
node scripts/deploy-check.js
```

For testing Stripe webhooks locally:

```bash
./scripts/stripe-webhook-test.sh
```

## Tech Stack

- **Frontend**: Next.js, React, Chakra UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Vercel Postgres)
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **AI Integration**: OpenAI API

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 

# FractiVerse Router - Deployment Guide

This document provides instructions for deploying the FractiVerse Router application to Vercel.

## Prerequisites

- A Vercel account
- A Stripe account (with API keys)
- A GitHub account (for deploying from a repository)

## Required Services

1. **Vercel Postgres Database**
   - Used for storing user data, tokens, and transactions

2. **Stripe**
   - For secure payment processing
   - Supports tax calculation

3. **NextAuth**
   - For user authentication

4. **OpenAI API**
   - For AI functionality

## Environment Variables

The following environment variables need to be set in your Vercel project:

```
# App
NEXT_PUBLIC_URL=https://your-vercel-domain.vercel.app

# Database
DATABASE_URL=[Your Vercel Postgres Connection String]

# NextAuth
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=[Generate a Secret]

# Stripe
STRIPE_SECRET_KEY=[Your Stripe Secret Key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[Your Stripe Publishable Key]
STRIPE_WEBHOOK_SECRET=[Your Stripe Webhook Secret]

# OpenAI
OPENAI_API_KEY=[Your OpenAI API Key]
```

## Deployment Steps

1. **Push your code to GitHub**

2. **Create a New Vercel Project**
   - Connect to your GitHub repository
   - Configure the environment variables

3. **Set Up Vercel Postgres**
   - Create a new Postgres database in the Vercel dashboard
   - Copy the connection string to your `DATABASE_URL` environment variable

4. **Initialize the Database**
   - The database will be automatically initialized during the first deployment due to the `vercel-build` script

5. **Configure Stripe Webhooks**
   - Create a webhook in your Stripe dashboard pointing to:
     `https://your-vercel-domain.vercel.app/api/stripe/webhook`
   - Make sure to select these events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the webhook signing secret to your `STRIPE_WEBHOOK_SECRET` environment variable

6. **Deploy**
   - Trigger a deploy in the Vercel dashboard

## Post-Deployment

1. **Test the application**
   - Make sure authentication is working
   - Test the token purchasing flow
   - Verify webhook functionality

2. **Set up monitoring**
   - Configure Vercel Analytics
   - Set up Stripe webhook monitoring

## Production Considerations

1. **Stripe Tax Integration**
   - For production, replace the mock tax calculation with Stripe Tax API

2. **Analytics**
   - Consider integrating with Vercel Analytics for usage monitoring
   
3. **Error Reporting**
   - Consider integrating with an error reporting service like Sentry

4. **Performance Monitoring**
   - Set up performance monitoring with Vercel Analytics

## Common Issues

- **Database Connection Issues**
  - Check that your `DATABASE_URL` is correctly set
  - Verify that the IP allows connections from Vercel

- **Stripe Webhook Errors**
  - Ensure the webhook secret is correctly set
  - Check that the webhook URL is correct and accessible

- **Missing Environment Variables**
  - Verify all required environment variables are set in the Vercel dashboard 