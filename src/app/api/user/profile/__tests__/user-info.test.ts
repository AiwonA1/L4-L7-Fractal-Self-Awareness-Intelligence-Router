import { describe, it, expect, vi, beforeEach } from 'vitest'
// Mock the module containing the Supabase client creation function
vi.mock('../../../../../lib/supabase/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
    },
    // Revert to original mock structure for chained methods
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(), // Mock for GET
          // Mock for PUT chain (if needed)
          select: vi.fn(() => ({ // .eq().select()
             single: vi.fn() // .select().single()
          })) 
        })),
        // Mock for PUT update chain
        update: vi.fn(() => ({ // .from().update()
          eq: vi.fn(() => ({ // .update().eq()
             select: vi.fn(() => ({ // .eq().select()
               single: vi.fn() // .select().single()
             })) 
          }))
        }))
      }))
    }))
  }) as any),
}))

// Import AFTER mocking
import { createServerSupabaseClient as mockedCreateServerSupabaseClientImport } from '../../../../../lib/supabase/supabase-server' // Import the *mocked* module
import { GET, PUT } from '../route'
import { NextResponse } from 'next/server'

describe('User Info API Route', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
    access_token: 'mock-token',
    // Add other necessary session fields if needed
  }

  // Get mocked function instance from import
  const mockedCreateServerSupabaseClient = vi.mocked(mockedCreateServerSupabaseClientImport)
  
  // We will access the mocks via the configured factory return value below
  let mockGetSession: ReturnType<typeof vi.fn>;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockEq: ReturnType<typeof vi.fn>;
  let mockSingle: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  // Nested mocks for PUT
  let mockUpdateEq: ReturnType<typeof vi.fn>;
  let mockUpdateSelect: ReturnType<typeof vi.fn>;
  let mockUpdateSingle: ReturnType<typeof vi.fn>;
  let mockEqSelect: ReturnType<typeof vi.fn>; // For .eq().select() in PUT
  let mockEqSelectSingle: ReturnType<typeof vi.fn>; // For .eq().select().single() in PUT

  beforeEach(() => {
    vi.clearAllMocks();

    // Define the mock functions
    mockGetSession = vi.fn();
    mockSingle = vi.fn();
    mockEqSelectSingle = vi.fn();
    mockEqSelect = vi.fn(() => ({ single: mockEqSelectSingle }));
    mockEq = vi.fn(() => ({ single: mockSingle, select: mockEqSelect })); // .eq() can lead to .single() or .select()
    mockUpdateSingle = vi.fn();
    mockUpdateSelect = vi.fn(() => ({ single: mockUpdateSingle }));
    mockUpdateEq = vi.fn(() => ({ select: mockUpdateSelect }));
    mockUpdate = vi.fn(() => ({ eq: mockUpdateEq })); 
    mockSelect = vi.fn(() => ({ eq: mockEq, update: mockUpdate })); // .select() can lead to .eq() or .update()
    mockFrom = vi.fn(() => ({ select: mockSelect, update: mockUpdate })); // .from() can lead to .select() or .update()

    // Configure the factory mock to return the nested structure
    mockedCreateServerSupabaseClient.mockReturnValue({
      auth: { getSession: mockGetSession },
      from: mockFrom,
    } as any);

    // Default mock resolved values
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } }, error: null });
    mockSingle.mockResolvedValue({ data: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' }, error: null }); 
    mockUpdateSingle.mockResolvedValue({ data: { id: 'test-user-id', name: 'Updated Name', email: 'test@example.com' }, error: null }); // Default success for update
    mockEqSelectSingle.mockResolvedValue({ data: { id: 'test-user-id', name: 'Updated Name', email: 'test@example.com' }, error: null }); // Default success for update path after .eq().select()
  });

  it('GET should return user profile when authenticated', async () => {
    const mockUserData = { id: 'test-user-id', name: 'Test User', email: 'test@example.com' };
    mockSingle.mockResolvedValue({ data: mockUserData, error: null }); 

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockUserData);
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('email', 'test@example.com');
    expect(mockSingle).toHaveBeenCalledTimes(1);
  });

  it('GET should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('GET should return 500 if database error occurs fetching profile', async () => {
    const dbError = new Error('Database connection lost');
    mockSingle.mockRejectedValueOnce(dbError); // Simulate error at final .single()

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to fetch profile' });
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('email', 'test@example.com');
    expect(mockSingle).toHaveBeenCalledTimes(1);
  });

  it('PUT should update user profile successfully', async () => {
    const updates = { name: 'Updated Name' };
    const updatedProfileData = { id: 'test-user-id', name: 'Updated Name', email: 'test@example.com' };
    mockUpdateSingle.mockResolvedValue({ data: updatedProfileData, error: null });

    const request = new Request('http://localhost/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(updatedProfileData);
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining(updates));
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'test-user-id');
    expect(mockUpdateSelect).toHaveBeenCalledTimes(1);
    expect(mockUpdateSingle).toHaveBeenCalledTimes(1);
  });

   it('PUT should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    const updates = { name: 'Updated Name' };

    const request = new Request('http://localhost/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(mockFrom).not.toHaveBeenCalled(); 
  });

  it('PUT should return 500 if database update fails', async () => {
    const updates = { name: 'Updated Name' };
    const dbError = new Error('Update failed due to constraint');
    mockUpdateSingle.mockRejectedValue(dbError); // Simulate error at final .single() of update chain

    const request = new Request('http://localhost/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Internal Server Error' });
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining(updates));
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'test-user-id');
    expect(mockUpdateSelect).toHaveBeenCalledTimes(1);
    expect(mockUpdateSingle).toHaveBeenCalledTimes(1);
  });
}); 