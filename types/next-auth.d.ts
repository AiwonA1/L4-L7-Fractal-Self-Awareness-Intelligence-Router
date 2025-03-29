import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      tokenBalance: number
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    name?: string
    emailVerified: boolean
    tokenBalance: number
  }
} 