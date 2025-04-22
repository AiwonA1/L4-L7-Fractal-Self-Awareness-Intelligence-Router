declare namespace NodeJS {
  interface ProcessEnv {
    OPENAI_API_KEY?: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    // Add other environment variables you use here
    // e.g., NEXT_PUBLIC_SUPABASE_URL?: string;
    // NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  }
}

// This ensures the file is treated as a module.
// Add an empty export statement if your tsconfig.json has "isolatedModules": true
export {}; 