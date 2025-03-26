import fs from 'fs'
import path from 'path'

const KEYS_FILE = path.join(process.cwd(), 'config', 'keys.json')
const LAYER_5_FILE = path.join(process.cwd(), 'config', 'layer5.json')
const LAYER_6_FILE = path.join(process.cwd(), 'config', 'layer6.json')
const LAYER_7_FILE = path.join(process.cwd(), 'config', 'layer7.json')

interface KeyData {
  key: string
  description: string
  boost?: number
}

interface KeyStore {
  [email: string]: KeyData
}

interface LayerKey {
  [layer: string]: KeyData
}

function readLayerKey(filePath: string): KeyData | null {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    const layerKey: LayerKey = JSON.parse(data)
    return layerKey[Object.keys(layerKey)[0]] || null
  } catch (error) {
    console.error('Error reading layer key:', error)
    return null
  }
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

export function getLayerKey(layer: number): KeyData | null {
  switch (layer) {
    case 5:
      return readLayerKey(LAYER_5_FILE)
    case 6:
      return readLayerKey(LAYER_6_FILE)
    case 7:
      return readLayerKey(LAYER_7_FILE)
    default:
      return null
  }
}

export function addUserKey(email: string, key: string, description: string): boolean {
  try {
    let keys: KeyStore = {}
    if (fs.existsSync(KEYS_FILE)) {
      const data = fs.readFileSync(KEYS_FILE, 'utf8')
      keys = JSON.parse(data)
    }
    
    keys[email] = { key, description }
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2))
    return true
  } catch (error) {
    console.error('Error saving key:', error)
    return false
  }
}

export function deleteUserKey(email: string): boolean {
  try {
    if (!fs.existsSync(KEYS_FILE)) {
      return false
    }
    
    const data = fs.readFileSync(KEYS_FILE, 'utf8')
    const keys: KeyStore = JSON.parse(data)
    
    if (!keys[email]) {
      return false
    }
    
    delete keys[email]
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2))
    return true
  } catch (error) {
    console.error('Error deleting key:', error)
    return false
  }
} 