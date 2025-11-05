/**
 * Environment variable validation
 * Ensures all required env vars are present before the app starts
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'JWT_SECRET',
  'ANTHROPIC_API_KEY',
] as const;

const optionalEnvVars = [
  'SENTRY_DSN',
  'LOG_LEVEL',
  'ENABLE_RATE_LIMITING',
  'RATE_LIMIT_REQUESTS',
  'RATE_LIMIT_WINDOW_MS',
] as const;

export interface EnvConfig {
  // Required
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  JWT_SECRET: string;
  ANTHROPIC_API_KEY: string;

  // Optional with defaults
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL: string;
  SENTRY_DSN?: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  ENABLE_RATE_LIMITING: boolean;
  RATE_LIMIT_REQUESTS: number;
  RATE_LIMIT_WINDOW_MS: number;
}

/**
 * Validate and return environment configuration
 * Called at build time and startup
 */
export function validateEnv(): EnvConfig {
  const missing: string[] = [];

  // Check required env vars
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please copy .env.example to .env and fill in the required values.`
    );
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security.'
    );
  }

  // Return validated config
  return {
    // Required
    DATABASE_URL: process.env.DATABASE_URL!,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    JWT_SECRET: process.env.JWT_SECRET!,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,

    // Optional with defaults
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    SENTRY_DSN: process.env.SENTRY_DSN,
    LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
    ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== 'false',
    RATE_LIMIT_REQUESTS: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  };
}

// Validate at module load time
let config: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!config) {
    config = validateEnv();
  }
  return config;
}
