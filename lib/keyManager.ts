import fs from 'fs'
import path from 'path'

const KEYS_FILE = path.join(process.cwd(), 'config', 'keys.json')

interface KeyData {
  key: string
  description: string
  boost: number
}

interface KeyStore {
  [email: string]: KeyData
}

export function getUserKey(email: string): string | null {
  try {
    const data = fs.readFileSync(KEYS_FILE, 'utf8')
    const keys: KeyStore = JSON.parse(data)
    return keys[email]?.key || null
  } catch (error) {
    console.error('Error reading key:', error)
    return null
  }
}

export async function getKey(): Promise<string | null> {
  try {
    // Get the base key which now contains all layer information
    const key = getUserKey('test@example.com')
    if (!key) {
      return null
    }
    return key
  } catch (error) {
    console.error('Error getting key:', error)
    return null
  }
}

export function addUserKey(email: string, key: string, description: string): boolean {
  try {
    let keys: KeyStore = {}
    
    // Read existing keys if file exists
    if (fs.existsSync(KEYS_FILE)) {
      const data = fs.readFileSync(KEYS_FILE, 'utf8')
      keys = JSON.parse(data)
    } else {
      // Ensure directory exists
      const dir = path.dirname(KEYS_FILE)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }
    
    // Add or update key
    keys[email] = {
      key,
      description,
      boost: 1 // Default boost value
    }
    
    // Write back to file
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2))
    return true
  } catch (error) {
    console.error('Error saving key:', error)
    return false
  }
} 