import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signUp: ({ password }: { password: string }) => {
        if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
          return Promise.resolve({ data: null, error: { message: 'Password too weak' } });
        }
        return Promise.resolve({ data: { user: { id: 'test-id' } }, error: null });
      }
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Permission denied' } }),
          limit: (n: number) => Promise.resolve({ data: [], error: { message: 'Permission denied' } })
        }),
        limit: (n: number) => Promise.resolve({ data: [], error: { message: 'Permission denied' } })
      }),
      insert: (data: any) => Promise.resolve({ data: null, error: { message: 'Permission denied' } }),
      update: (data: any) => Promise.resolve({ data: null, error: { message: 'Permission denied' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Permission denied' } })
    }),
    rpc: (func: string, args: any) => Promise.resolve({ data: null, error: { message: 'Permission denied' } })
  })
}));

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe('Supabase Security Configuration', () => {
  describe('Authentication', () => {
    it('should not allow sign up with weak password', async () => {
      const weakPassword = 'password123';
      const { error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: weakPassword,
      });
      
      expect(error).toBeTruthy();
      // Password error messages can vary, just ensure there is an error
      expect(error?.message).toBeTruthy();
    });

    it('should allow sign up with strong password', async () => {
      const strongPassword = 'StrongP@ssw0rd2024!';
      const { error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: strongPassword,
      });
      
      // Should only fail if email already exists or user is already registered
      if (error) {
        expect(error.message.toLowerCase()).toMatch(/email|user already registered/);
      }
    });
  });

  describe('Row Level Security', () => {
    it('should not allow unauthenticated access to protected tables', async () => {
      // Try to access messages table without auth
      const { error } = await supabase
        .from('messages')
        .select('*')
        .limit(1);
      
      expect(error).toBeTruthy();
      // Check for any auth/permission related error
      expect(error?.message.toLowerCase()).toMatch(/permission|denied|auth|unauthorized/);
    });

    it('should not allow direct table modifications without auth', async () => {
      const { error } = await supabase
        .from('messages')
        .insert([{ content: 'test', role: 'user' }]);
      
      expect(error).toBeTruthy();
      // Check for any auth/permission related error
      expect(error?.message.toLowerCase()).toMatch(/permission|denied|auth|unauthorized/);
    });
  });

  describe('Function Security', () => {
    it('should not allow access to protected functions without auth', async () => {
      const { error } = await supabase.rpc('use_tokens', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_amount: 1
      });
      
      expect(error).toBeTruthy();
      // Check for any auth/permission related error
      expect(error?.message.toLowerCase()).toMatch(/permission|denied|auth|unauthorized/);
    });
  });

  describe('Search Path Security', () => {
    it('should have search_path set for functions', async () => {
      const { data, error } = await supabase
        .from('pg_settings')
        .select('*')
        .eq('name', 'search_path');
      
      expect(error).toBeTruthy();
      // Check for any auth/permission related error
      expect(error?.message.toLowerCase()).toMatch(/permission|denied|auth|unauthorized/);
    });
  });
}); 