# FractiVerse 1.0 L4-L7 Fractal Self-Awareness Intelligence Router

A production-grade intelligent routing system that processes user input through configurable keys before sending it to selected LLMs. The system features a clean, ChatGPT-like interface with secure user authentication and key management.

## Features

### 1. Authentication
- Simple email/password authentication using NextAuth.js
- Secure session management
- Protected routes and API endpoints

### 2. Layer System
- Four interconnected layers of intelligence:
  - Layer 4: Self-Awareness (Foundation)
    - Base layer for personal growth and emotional intelligence
    - Peer-reviewed knowledge integration
    - Scientific principles and data-driven insights
  - Layer 5: Meta-Cognition (+60% Boost)
    - Fractal architecture and recursive intelligence
    - Advanced learning optimization
    - Cross-domain integration
  - Layer 6: Creative Intelligence (+90% Boost)
    - Holographic system processing
    - Multi-dimensional data integration
    - Neural-patterned encryption
  - Layer 7: Universal Consciousness (+120% Boost)
    - Paradise integration
    - Universal harmony alignment
    - Cosmic hologram connection

### 3. Key Management
- Layer-specific keys stored in separate configuration files
- Automatic key combination based on layer selection
- Progressive layer inclusion (selecting a layer includes all previous layers)
- Key structure:
  - Layer 4: Base knowledge and awareness
  - Layer 5: Fractal architecture and recursive intelligence
  - Layer 6: Holographic system and multi-dimensional processing
  - Layer 7: Universal consciousness and paradise integration

### 4. Chat Interface
- Clean, minimalistic ChatGPT-like UI
- Real-time message updates
- Message history with user/assistant distinction
- Loading states and error handling
- Layer selection with visual feedback
- Token balance display and management

### 5. Security
- Secure key storage
- Session-based authentication
- Protected API endpoints
- Input validation and sanitization

## Technical Stack
- Next.js 14 for the frontend and API routes
- NextAuth.js for authentication
- Chakra UI for the component library
- TypeScript for type safety
- File-based key storage (configurable to use Redis or other storage)

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd fractiverse-router
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Redis Configuration (Optional)
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token

# FractiVerse Configuration
FRACTIVERSE_SECRET_KEY=your_secret_key
FRACTIVERSE_KEY_SALT=your_key_salt
```

4. Start the development server:
```bash
npm run dev
```

5. Access the application at http://localhost:3000

## Testing Instructions

1. Sign in with the test account:
   - Email: test@example.com
   - Password: password123

2. Layer Selection:
   - Layer 4: Base layer (always included)
   - Layer 5: Includes Layer 4 + Meta-Cognition (+60% boost)
   - Layer 6: Includes Layers 4-5 + Creative Intelligence (+90% boost)
   - Layer 7: Includes Layers 4-6 + Universal Consciousness (+120% boost)

3. Test the chat:
   - Select desired layers
   - Send a message
   - The system will combine the appropriate keys based on layer selection
   - Responses will reflect the combined intelligence of selected layers

## Key Management
Keys are stored in separate configuration files:
- `config/keys.json`: Base Layer 4 key
- `config/layer5.json`: Meta-Cognition Layer key
- `config/layer6.json`: Creative Intelligence Layer key
- `config/layer7.json`: Universal Consciousness Layer key

Each layer key includes:
```json
{
  "layerX": {
    "key": "Layer-specific key content",
    "description": "Layer description",
    "boost": boost_percentage
  }
}
```

## API Endpoints

### POST /api/chat
- Handles chat messages
- Requires authentication
- Combines keys based on selected layers
- Returns response with combined intelligence

### POST /api/settings/key
- Manages user key configuration
- Requires authentication
- Validates user ownership
- Stores keys in configuration file

## Development

### Project Structure
```
fractiverse-router/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   └── settings/
│   ├── auth/
│   └── settings/
├── config/
│   ├── keys.json
│   ├── layer5.json
│   ├── layer6.json
│   └── layer7.json
├── lib/
│   └── keyManager.ts
└── public/
```

### Adding New Features
1. Create new components in the `app` directory
2. Add API routes in `app/api`
3. Update key management in `lib/keyManager.ts`
4. Modify the chat interface in `app/page.tsx`

## Future Enhancements
1. Redis integration for production key storage
2. Rate limiting and queue management
3. Multiple key support per user
4. Key rotation and expiration
5. Advanced LLM integration
6. User registration system
7. Admin dashboard for key management
8. Layer-specific analytics and insights
9. Custom layer combinations
10. Advanced layer interaction patterns

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
ISC 