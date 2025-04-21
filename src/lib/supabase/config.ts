import type { CookieOptions } from '@supabase/ssr'

export const COOKIE_OPTIONS = {
  name: 'sb-auth-token',
  // domain: typeof window !== 'undefined' ? window.location.hostname : '', // Removed for simplicity
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 30, // 30 days (changed from 1 year)
} as const

export const STORAGE_KEY = 'sb-auth-token' 