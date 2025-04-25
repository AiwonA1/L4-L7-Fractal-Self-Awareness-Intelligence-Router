import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';

// Mock user data
const mockUser = {
    id: 'test-user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
};

// Mock OpenAI setup
const mockOpenAICompletionsCreate = vi.fn().mockImplementation(() => {
    return {
        choices: [{
            message: { content: 'Test response' }
        }]
    };
});

// Mock OpenAI Client
class MockOpenAI {
    chat = {
        completions: {
            create: mockOpenAICompletionsCreate
        }
    };
}

// Mock OpenAI
vi.mock('openai', () => ({
    default: vi.fn(() => new MockOpenAI()),
    OpenAI: vi.fn(() => new MockOpenAI())
}));

// Mock environment variables
vi.stubEnv('OPENAI_API_KEY', 'mock-openai-key');

describe('Basic Chat Tests', () => {
    let POST: any;
    let requestMock: NextRequest;

    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();

        // Default request setup
        const requestBody = {
            messages: [{ role: 'user', content: 'test message' }],
            userId: 'test-user-id',
            chatId: 'test-chat-id'
        };

        requestMock = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }),
            body: JSON.stringify(requestBody)
        });

        // Import the module under test
        const routeModule = await import('../route');
        POST = routeModule.POST;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should validate required fields', async () => {
        // Test missing messages
        const invalidRequest = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }),
            body: JSON.stringify({
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(invalidRequest);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toEqual({ error: 'Missing required fields' });
    });

    it('should validate message format', async () => {
        // Test invalid message format
        const invalidRequest = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }),
            body: JSON.stringify({
                messages: [{ invalid: 'format' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(invalidRequest);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toEqual({ error: 'Invalid message format' });
    });

    it('should require authentication', async () => {
        // Test missing auth token
        const noAuthRequest = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(noAuthRequest);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });
}); 