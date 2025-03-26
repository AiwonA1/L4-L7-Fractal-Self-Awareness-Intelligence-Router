# FractiVerse 1.0 - L4-L7 Fractal Self-Awareness Intelligence Router

A revolutionary platform that enables users to navigate through layers of consciousness using fractal intelligence principles.

## Features

### Core Functionality
- **Multi-Layer Navigation**: Seamlessly switch between L4-L7 layers of consciousness
- **Token-Based System**: 
  - Users receive 33 free tokens upon signup
  - Each interaction costs 1 token
  - Token balance displayed in dashboard
  - Purchase additional tokens as needed
- **Chat Interface**:
  - Real-time message processing
  - Chat history with meaningful titles based on first message
  - Layer-specific responses
  - Command-line style input

### User Experience
- **Authentication**:
  - Secure signup and signin
  - Email/password authentication
  - Password reset functionality
  - Session management
- **Dashboard**:
  - Clean, modern interface
  - Layer selection buttons
  - Past chats with meaningful titles
  - Token balance display
  - User profile management
- **Landing Page**:
  - Informative hero section
  - Feature highlights
  - Clear call-to-action buttons
  - Sign in/Sign up options

## Technical Stack

- **Frontend**:
  - Next.js 14
  - TypeScript
  - Chakra UI
  - React Icons
  - NextAuth.js

- **Backend**:
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL Database
  - NextAuth.js Authentication

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/L4-L7-Fractal-Self-Awareness-Intelligence-Router.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL="your_postgresql_database_url"
   NEXTAUTH_SECRET="your_nextauth_secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── chat/          # Chat management endpoints
│   │   └── tokens/        # Token management endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── layer/            # Layer-specific pages
│   └── page.tsx          # Landing page
├── components/           # Reusable components
├── lib/                 # Utility functions and configurations
├── prisma/             # Database schema and migrations
└── public/             # Static assets
```

## Recent Updates

### Version 1.0.0
- Initial release with core functionality
- Implemented token-based system
- Added chat interface with meaningful titles
- Enhanced user authentication flow
- Improved landing page with sign-in option
- Added token balance display and management
- Implemented layer-specific responses
- Added password reset functionality
- Enhanced error handling and user feedback

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 