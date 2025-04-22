declare namespace NodeJS {
  interface ProcessEnv {
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    OPENAI_API_KEY?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
    // Add other environment variables here if needed
  }
}

// This ensures the file is treated as a module.
// Add an empty export statement if your tsconfig.json has "isolatedModules": true
export {}; 