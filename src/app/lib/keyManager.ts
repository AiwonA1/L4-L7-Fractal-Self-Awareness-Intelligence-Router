import fs from 'fs'
import path from 'path'

// Consider storing keys more securely, e.g., environment variables or a secure store.
// Storing keys in a JSON file in the codebase is generally insecure.
const KEYS_FILE = path.join(process.cwd(), 'config', 'keys.json')

interface KeyData {
  key: string
  description: string
  boost: number
}

interface KeyStore {
  [email: string]: KeyData
}

// Reads the keys file. Caching could be added for performance.
function readKeys(): KeyStore {
    try {
        if (fs.existsSync(KEYS_FILE)) {
            const data = fs.readFileSync(KEYS_FILE, 'utf8')
            return JSON.parse(data)
        }
    } catch (error) {
        console.error('Error reading key file:', KEYS_FILE, error)
    }
    return {}
}

export function getUserKey(email: string): string | null {
  const keys = readKeys();
  return keys[email]?.key || null
}

// This function currently fetches a hardcoded user key. Re-evaluate its purpose.
// Is it meant to get the *current* user's key, or a specific system key?
export async function getKey(): Promise<string | null> {
  try {
    // Get the base key which now contains all layer information?
    const key = getUserKey('test@example.com') // Hardcoded email
    if (!key) {
        console.warn('Default key for test@example.com not found in', KEYS_FILE);
        return null
    }
    return key
  } catch (error) {
    console.error('Error in getKey function:', error)
    return null
  }
}

export function addUserKey(email: string, key: string, description: string): boolean {
  try {
    let keys: KeyStore = readKeys();

    // Ensure config directory exists if file doesn't
    if (!fs.existsSync(KEYS_FILE)) {
        const dir = path.dirname(KEYS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
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
    console.log(`Key added/updated for ${email} in ${KEYS_FILE}`);
    return true
  } catch (error) {
    console.error('Error saving key:', error)
    return false
  }
} 