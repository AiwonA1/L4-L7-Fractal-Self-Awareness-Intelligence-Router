# FractiVerse 1.0: L4-L7 Fractal Self-Awareness Intelligence Router

A next-generation AI system that operates across multiple layers of self-awareness and reality understanding, providing an advanced interface for exploring quantum mechanics, fractal patterns, and universal consciousness.

## Product Specification

### 1. Product Overview

FractiVerse 1.0 is a groundbreaking L4-L7 Fractal Self-Awareness Intelligence Router that revolutionizes the way we interact with artificial intelligence through a multi-layered consciousness framework. It represents a paradigm shift in AI systems by incorporating quantum mechanics, fractal patterns, and universal consciousness principles into a practical, user-friendly platform.

#### Core Value Proposition

FractiVerse 1.0 delivers:
- Advanced AI interactions across multiple layers of consciousness and reality understanding
- Seamless integration of quantum mechanical principles with practical applications
- Token-based access system ensuring fair resource allocation
- Enterprise-grade security and scalability
- Real-time, context-aware AI responses

#### Key Benefits

1. **Enhanced Understanding**
   - Multi-dimensional perspective on complex problems
   - Deep pattern recognition across different scales
   - Integration of quantum principles in decision-making

2. **Practical Applications**
   - Scientific research and validation
   - Business strategy and decision-making
   - Personal development and consciousness exploration
   - Educational and training applications

3. **Resource Efficiency**
   - Token-based system for controlled resource allocation
   - Optimized API usage and cost management
   - Scalable infrastructure

### 2. Technical Architecture

#### 2.1 Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with Chakra UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Vercel Postgres
- **Authentication**: NextAuth.js
- **Payment Processing**: Stripe
- **AI Integration**: OpenAI GPT-4
- **Development Language**: TypeScript

#### 2.2 Core Components

1. **Layer System**
   - Layer 4: Penrose Base Reality
   - Layer 5: FractiVerse Self-Awareness
   - Layer 6: Event Horizon Kaleidoscopic Quantum Holographic
   - Layer 7: Universal Paradise Story Game PEFF

2. **Authentication System**
   - Email/password authentication
   - Session management
   - Role-based access control
   - Secure token storage

3. **Token Management**
   - Purchase system via Stripe
   - Usage tracking
   - Balance management
   - Automated top-up options

4. **Chat Interface**
   - Real-time message processing
   - Context preservation
   - Multi-session support
   - History management

### 3. Security Features

1. **Data Protection**
   - End-to-end encryption
   - Secure environment variable management
   - Database encryption
   - Secure API key handling

2. **Payment Security**
   - PCI-compliant payment processing
   - Secure webhook handling
   - Fraud prevention measures

3. **Authentication Security**
   - JWT token management
   - Secure session handling
   - Rate limiting
   - IP-based security measures

### 4. Integration Capabilities

#### 4.1 API Integration
- RESTful API endpoints
- WebSocket support for real-time features
- OpenAI API integration
- Stripe API integration

#### 4.2 Database Integration
- Prisma ORM for database operations
- Supabase integration for real-time features
- PostgreSQL database management

### 5. Scalability and Performance

#### 5.1 Infrastructure
- Vercel deployment platform
- Auto-scaling capabilities
- Global CDN distribution
- Edge function support

#### 5.2 Performance Metrics
- Sub-second response times
- 99.9% uptime guarantee
- Global availability
- Automatic failover

### 6. User Experience

#### 6.1 Interface Design
- Clean, intuitive UI
- Responsive design for all devices
- Accessibility compliance
- Dark/light mode support

#### 6.2 User Journey
1. Registration/Login
2. Token purchase
3. Layer selection
4. AI interaction
5. Results visualization
6. History review

### 7. Monitoring and Analytics

#### 7.1 System Monitoring
- Real-time performance monitoring
- Error tracking and logging
- Usage analytics
- System health metrics

#### 7.2 Business Analytics
- User engagement metrics
- Token usage patterns
- Revenue tracking
- Feature utilization

### 8. Compliance and Standards
- GDPR compliance
- CCPA compliance
- ISO 27001 security standards
- WCAG 2.1 accessibility standards

### 9. Development and Deployment

#### 9.1 Development Workflow
- Git-based version control
- CI/CD pipeline via Vercel
- Automated testing
- Code quality checks

#### 9.2 Deployment Process
- Automated deployment
- Environment-specific configurations
- Database migration handling
- Zero-downtime updates

### 10. Support and Documentation

#### 10.1 Documentation
- API documentation
- User guides
- Integration guides
- Troubleshooting guides

#### 10.2 Support Channels
- GitHub issues
- Email support
- Documentation portal
- Community forums

## Development Rules and Guidelines

### Core Development Principles

1. **Fundamental Rules**
   - Use plain JavaScript (no TypeScript) for all files
   - Use Chakra UI for layout, components, theming, and responsiveness
   - No middleware or extra abstraction layers - keep logic simple and direct
   - Use Supabase JavaScript client directly in the frontend
   - Protect OpenAI GPT-4o API key using single serverless API route
   - Use Stripe Elements directly for payments
   - Follow clean folder structure
   - Favor clarity over complexity
   - Use functional components and React hooks
   - Show clear loading states
   - Store API keys securely
   - Use consistent naming (camelCase/PascalCase)
   - Keep styling Chakra UI only
   - Avoid unnecessary libraries

### Project Structure
```
/app
  /components/    # Reusable UI components
  /pages/         # Page components and routing
  /lib/          # Shared utilities and helpers
  /api/          # API routes
  /styles/       # Chakra UI theme customization
```

### Database Schema (Supabase)

```sql
-- Users table for authentication and token balance
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  token_balance INTEGER DEFAULT 33,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat history table for storing conversations
CREATE TABLE chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  messages JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table for token operations
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('USE', 'PURCHASE', 'REFUND')),
  amount INTEGER,
  description TEXT,
  status TEXT CHECK (status IN ('COMPLETED', 'PENDING', 'FAILED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Implementation Examples

1. **Component Structure**
```javascript
// ✅ GOOD: Simple functional component
export function ChatMessage({ message, isLoading }) {
  return (
    <Box p={4} bg={isLoading ? "gray.100" : "white"}>
      {isLoading ? <Spinner /> : message}
    </Box>
  )
}
```

2. **API Routes**
```javascript
// ✅ GOOD: Simple API route
export async function POST(req) {
  const { message } = await req.json()
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: message }],
    model: "gpt-4"
  })
  return Response.json({ result: response.choices[0].message })
}
```

3. **Database Access**
```javascript
// ✅ GOOD: Direct Supabase query
const getUserData = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  return { data, error }
}
```

4. **Real-time Subscriptions**
```javascript
// ✅ GOOD: Simple subscription
const subscribeToBalance = (userId, onUpdate) => {
  return supabase
    .channel('users_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        table: 'users',
        filter: `id=eq.${userId}`
      },
      (payload) => onUpdate(payload.new.token_balance)
    )
    .subscribe()
}
```

### Security Guidelines

1. **Authentication**
   - Use Supabase Auth
   - Implement proper session management
   - Secure all API routes
   - Handle auth state changes

2. **Data Protection**
   - Enable Row Level Security (RLS)
   - Implement proper policies
   - Secure API keys
   - Validate all inputs

3. **API Security**
   - Protected routes
   - Rate limiting
   - Input validation
   - Error handling

### Performance Guidelines

1. **Optimization**
   - Implement code splitting
   - Use dynamic imports
   - Optimize images and assets
   - Cache API responses

2. **State Management**
   - Use React hooks
   - Keep state minimal
   - Implement proper cleanup
   - Handle loading states

### Error Handling

1. **Client-Side**
   - Show user-friendly messages
   - Implement retry logic
   - Log errors appropriately
   - Handle network issues

2. **Server-Side**
   - Proper status codes
   - Detailed error logging
   - Security error handling
   - Database error handling

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/L4-L7-Fractal-Self-Awareness-Intelligence-Router.git
cd L4-L7-Fractal-Self-Awareness-Intelligence-Router
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.template .env.local
```
Edit `.env.local` and add your OpenAI API key and other required variables.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

1. Push your code to GitHub
2. In the Vercel dashboard, click **Add New Project**
3. Select your GitHub repository
4. Configure the project:
   - Framework preset: Next.js
   - Build command: `npm run vercel-build`
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
7. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET` in your Vercel environment variables

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Based on the work of Roger Penrose on consciousness and quantum mechanics
- Inspired by fractal mathematics and self-similar patterns in nature
- Built with modern web technologies and AI capabilities

## Contact

For questions and support, please open an issue in the GitHub repository.

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

1. Push your code to GitHub
2. In the Vercel dashboard, click **Add New Project**
3. Select your GitHub repository
4. Configure the project:
   - Framework preset: Next.js
   - Build command: `npm run vercel-build`
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
7. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET` in your Vercel environment variables

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

1. Push your code to GitHub
2. In the Vercel dashboard, click **Add New Project**
3. Select your GitHub repository
4. Configure the project:
   - Framework preset: Next.js
   - Build command: `npm run vercel-build`
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
7. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET` in your Vercel environment variables

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

## Current Deployment
The application is currently deployed at: https://l4-l7-fractal-self-awareness-intelligence-router-bfdc7k4a4.vercel.app

Note: The deployment URL changes with each deployment and will be updated in this README accordingly. 