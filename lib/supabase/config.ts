import type { CookieOptions } from '@supabase/ssr'

export const COOKIE_OPTIONS = {
  name: 'sb-auth-token',
  domain: typeof window !== 'undefined' ? window.location.hostname : '',
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 365, // 1 year
} as const

export const STORAGE_KEY = 'sb-' + (process.env.NEXT_PUBLIC_SUPABASE_URL || '').split('//')[1].split('.')[0] 