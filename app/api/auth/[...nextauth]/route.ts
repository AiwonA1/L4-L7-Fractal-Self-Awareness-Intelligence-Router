import NextAuth, { AuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '../../../lib/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

// Test user for development
const TEST_USER = {
  id: '1',
  email: 'test@example.com',
  password: 'password123'
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 [NextAuth] Authorization Started')
        console.log('📧 [NextAuth] Email:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [NextAuth] Missing credentials')
          throw new Error('Please enter an email and password')
        }

        // Check for test user
        if (credentials.email === TEST_USER.email) {
          console.log('🧪 [NextAuth] Test user login attempt')
          if (credentials.password !== TEST_USER.password) {
            console.log('❌ [NextAuth] Invalid password for test user')
            throw new Error('Invalid password')
          }
          console.log('✅ [NextAuth] Test user authenticated')
          return {
            id: TEST_USER.id,
            email: TEST_USER.email,
            name: 'Test User',
          }
        }

        try {
          console.log('🔍 [NextAuth] Database user lookup:', credentials.email)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            console.log('❌ [NextAuth] User not found or no password set')
            throw new Error('Invalid email or password')
          }

          const isValid = await compare(credentials.password, user.password)
          console.log('🔐 [NextAuth] Password validation:', isValid)
          
          if (!isValid) {
            console.log('❌ [NextAuth] Invalid password for database user')
            throw new Error('Invalid password')
          }

          console.log('✅ [NextAuth] Database user authenticated:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('💥 [NextAuth] Authorization error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('🎟️ [NextAuth] JWT Callback')
      console.log('📄 [NextAuth] Token:', { ...token, sub: undefined })
      console.log('👤 [NextAuth] User:', user)
      
      if (user) {
        console.log('✨ [NextAuth] Updating token with user data')
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      console.log('🔄 [NextAuth] Session Callback')
      console.log('📝 [NextAuth] Initial Session:', { ...session, user: { ...session.user, image: undefined } })
      console.log('🎟️ [NextAuth] Token:', { ...token, sub: undefined })
      
      if (session.user) {
        console.log('✨ [NextAuth] Updating session with token data')
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      
      console.log('✅ [NextAuth] Final Session:', { ...session, user: { ...session.user, image: undefined } })
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 