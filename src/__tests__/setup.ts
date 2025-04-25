import { beforeAll, afterAll } from 'vitest'
import dotenv from 'dotenv'
import path from 'path'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Load test environment variables
dotenv.config({
  path: path.resolve(__dirname, '../../.env.test')
})

// Required environment variables for tests
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
] as const

// Check required environment variables
beforeAll(() => {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }
})

// Mock cookie store implementation
const mockCookieStore = new Map<string, string>()

// Mock next/headers with synchronous operations
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => {
      const value = mockCookieStore.get(name)
      return value ? { name, value } : undefined
    },
    set: ({ name, value }: { name: string; value: string }) => {
      mockCookieStore.set(name, value)
      return undefined
    },
    delete: ({ name }: { name: string }) => {
      mockCookieStore.delete(name)
      return undefined
    },
    getAll: () => Array.from(mockCookieStore).map(([name, value]) => ({ name, value }))
  }),
  headers: () => new Headers()
}))

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    role: 'authenticated'
  }
};

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: () => {
        if (mockCookieStore.has('sb-access-token')) {
          return Promise.resolve({ 
            data: { session: { user: { id: 'test-user-id' } } },
            error: null 
          });
        }
        return Promise.resolve({ data: { session: null }, error: null });
      },
      signUp: ({ email, password }: { email: string, password: string }) => {
        // Check password strength
        if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
          return Promise.resolve({ data: null, error: { message: 'Password too weak' } });
        }
        // Check if email already exists
        if (mockCookieStore.has('sb-access-token')) {
          return Promise.resolve({ data: null, error: { message: 'User already registered' } });
        }
        // Successful signup
        mockCookieStore.set('sb-access-token', 'mock-token');
        return Promise.resolve({ data: { user: { id: 'test-id' } }, error: null });
      }
    },
    from: (table: string) => {
      interface ChainableResponse {
        data: any;
        error: any;
        select: (columns?: string) => ChainableResponse;
        insert: (newData: any) => Promise<{ data: any; error: any }>;
        update: (updateData: any) => ChainableResponse;
        delete: () => ChainableResponse;
        eq: (column: string, value: any) => ChainableResponse;
        order: (column: string, options: any) => ChainableResponse;
        limit: (n: number) => ChainableResponse;
        single: () => Promise<{ data: any; error: any }>;
        match: (criteria: any) => Promise<{ data: any; error: any }>;
        then: (callback: any) => Promise<{ data: any; error: any }>;
        [key: string]: any;
      }

      const createChainable = (data: any = null, error: any = null): ChainableResponse => {
        const chain: ChainableResponse = {
          data,
          error,
          select: (columns?: string) => createChainable(data, error),
          insert: (newData: any) => Promise.resolve({ data: newData, error: null }),
          update: (updateData: any) => createChainable(updateData, error),
          delete: () => createChainable(null, error),
          eq: (column: string, value: any) => {
            // Special cases for specific user IDs
            if (column === 'id' && value === 'user-insufficient-tokens') {
              return createChainable({ fracti_token_balance: 0 }, null);
            }
            if (column === 'id' && value === 'user-db-error') {
              return createChainable(null, { message: 'Database error' });
            }
            return createChainable(data, error);
          },
          order: (column: string, options: any) => createChainable(data, error),
          limit: (n: number) => createChainable(data, error),
          single: () => {
            if (data && data.fracti_token_balance === 0) {
              throw new Error('Insufficient token balance');
            }
            if (error && error.message === 'Database error') {
              throw new Error('Database error');
            }
            return Promise.resolve({ data, error });
          },
          match: (criteria: any) => Promise.resolve({ data, error }),
          then: (callback: any) => Promise.resolve({ data, error }).then(callback)
        };
        
        // Add all methods to the chain object
        Object.keys(chain).forEach(key => {
          if (typeof chain[key] === 'function') {
            chain[key] = chain[key].bind(chain);
          }
        });
        
        return chain;
      };

      // Default behavior based on authentication
      const hasAuth = mockCookieStore.has('sb-access-token');
      const defaultError = hasAuth ? null : { message: 'Permission denied' };
      const defaultData = hasAuth ? { id: 'test-id', title: 'Test Chat' } : null;

      // Special cases for specific tables
      if (table === 'users') {
        return createChainable({ fracti_token_balance: 10 }, null);
      }
      if (table === 'pg_settings') {
        return createChainable(null, { message: 'Permission denied' });
      }

      return createChainable(defaultData, defaultError);
    },
    rpc: (func: string, args: any) => {
      if (!mockCookieStore.has('sb-access-token')) {
        return Promise.resolve({ data: null, error: { message: 'Permission denied' } });
      }
      if (func === 'use_tokens' && args.p_user_id === 'user-insufficient-tokens') {
        return Promise.resolve({ data: null, error: { message: 'Insufficient token balance' } });
      }
      if (func === 'use_tokens' && args.p_user_id === 'user-db-error') {
        return Promise.resolve({ data: null, error: { message: 'Database error' } });
      }
      return Promise.resolve({ data: { success: true }, error: null });
    }
  })
}))

// Mock verifyUserAccess function
vi.mock('../route', () => ({
  verifyUserAccess: async (userId: string) => {
    if (userId === 'user-insufficient-tokens') {
      throw new Error('Insufficient token balance');
    }
    if (userId === 'user-db-error') {
      throw new Error('Database error');
    }
    return true;
  }
}));

// Add cleanup after all tests
afterAll(() => {
  vi.clearAllMocks()
  mockCookieStore.clear()
})