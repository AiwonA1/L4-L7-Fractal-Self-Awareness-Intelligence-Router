import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Make Redis optional for development
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Create a fallback rate limiter for development
const createRateLimit = (requests: number, duration: number) => {
  if (!redis) {
    // Return a mock rate limiter for development
    return {
      limit: async () => ({ success: true, reset: Date.now() + duration }),
    }
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${duration} ms`),
  })
}

// Rate limiters with different configurations
export const apiLimiter = createRateLimit(100, 60000) // 100 requests per minute
export const authLimiter = createRateLimit(5, 60000)  // 5 attempts per minute
export const paymentLimiter = createRateLimit(10, 60000) // 10 attempts per minute

export type LimiterType = 'api' | 'auth' | 'payment'

export async function rateLimit(identifier: string, type: LimiterType) {
  const limiter = {
    'api': apiLimiter,
    'auth': authLimiter,
    'payment': paymentLimiter,
  }[type]

  return await limiter.limit(identifier)
} 