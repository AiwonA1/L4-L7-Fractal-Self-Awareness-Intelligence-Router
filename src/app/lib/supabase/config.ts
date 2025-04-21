import type { CookieOptions } from '@supabase/ssr'

// Cookie options passed to Supabase client helpers
export const COOKIE_OPTIONS: Omit<CookieOptions, 'name'> = {
  // domain: typeof window !== 'undefined' ? window.location.hostname : undefined, // Avoid setting domain unless needed
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  // httpOnly: true, // Managed by auth helpers
} as const

// LocalStorage key used by supabase-js v2 by default
// Often corresponds to the cookie name but used for localStorage persistence
export const STORAGE_KEY = 'sb-auth-token' 