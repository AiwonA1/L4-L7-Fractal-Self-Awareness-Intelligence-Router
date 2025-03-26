import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
})

// Rate limit configuration
const RATE_LIMIT_REQUESTS = 50 // Number of requests
const RATE_LIMIT_WINDOW = 3600 // Time window in seconds (1 hour)

export async function rateLimit(identifier: string): Promise<{ success: boolean }> {
  const now = Date.now()
  const key = `rate-limit:${identifier}`
  
  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(key, 0, now - RATE_LIMIT_WINDOW * 1000)
  pipeline.zadd(key, { score: now, member: now.toString() })
  pipeline.zcard(key)
  pipeline.expire(key, RATE_LIMIT_WINDOW)
  
  const results = await pipeline.exec()
  const requestCount = results[2] as number

  return {
    success: requestCount <= RATE_LIMIT_REQUESTS
  }
} 