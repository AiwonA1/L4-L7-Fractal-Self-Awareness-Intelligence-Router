import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

interface ExtendedUser {
  id: string;
  email: string;
  name: string | null;
  tokenBalance: number;
}

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      tokenBalance: number;
      image?: string | null;
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter your email and password')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            throw new Error('No account found with this email')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)

          if (!isValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            tokenBalance: user.tokenBalance
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw error
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        if (user) {
          token.id = user.id
          token.tokenBalance = (user as ExtendedUser).tokenBalance
        }

        if (account?.provider === 'google') {
          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: token.email! }
            })

            if (!existingUser) {
              const newUser = await prisma.user.create({
                data: {
                  email: token.email!,
                  name: token.name,
                  password: '', // Google users don't need password
                  tokenBalance: 0
                }
              })
              token.id = newUser.id
              token.tokenBalance = newUser.tokenBalance
            } else {
              token.id = existingUser.id
              token.tokenBalance = existingUser.tokenBalance
            }
          } catch (error) {
            console.error('Error handling Google user:', error)
            throw new Error('Failed to process Google sign-in')
          }
        }

        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.id as string
          session.user.tokenBalance = token.tokenBalance as number
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // If the url is relative, prefix it with the base URL
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`
        }
        
        // If the url is absolute and on the same domain, allow it
        if (url.startsWith(baseUrl)) {
          return url
        }
        
        // Default to dashboard for authenticated users
        return `${baseUrl}/dashboard`
      } catch (error) {
        console.error('Redirect callback error:', error)
        return baseUrl
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET
} 