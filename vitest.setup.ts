import '@testing-library/jest-dom'
import { beforeAll } from 'vitest'
import dotenv from 'dotenv'

// Load environment variables for testing
dotenv.config({ path: '.env.test' })

// Increase test timeout for network requests
beforeAll(() => {
  vi.setConfig({
    testTimeout: 15000 // 15 seconds to account for network latency
  })
}) 