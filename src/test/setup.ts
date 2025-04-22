import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/supabase/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// Mock next/headers
vi.mock('next/headers', async (importOriginal) => {
  const original = await importOriginal() as typeof import('next/headers');
  return {
    ...original,
    cookies: () => ({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    }),
    headers: () => new Headers(),
  };
})

// Mock next/server
vi.mock('next/server', async (importOriginal) => {
  const original = await importOriginal() as typeof import('next/server');
  return {
    ...original,
    NextResponse: {
      ...original.NextResponse,
      json: vi.fn((body?: any, init?: ResponseInit) => {
        const status = init?.status || 200;
        return {
          status: status,
          headers: new Headers(init?.headers),
          json: async () => Promise.resolve(body),
          ok: status >= 200 && status < 300,
          text: async () => Promise.resolve(JSON.stringify(body)),
        } as any;
      }),
    },
  };
}); 