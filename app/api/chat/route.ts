import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getUserKey, getLayerKey } from '@/lib/keyManager'

export async function POST(request: Request) {
  try {
    // Get the session
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { message, layers } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get the base user key (Layer 4)
    const userKey = getUserKey('test@example.com')
    if (!userKey) {
      return NextResponse.json(
        { error: 'System key not found' },
        { status: 500 }
      )
    }

    // Get layer-specific keys for selected layers 5-7
    const layerKeys = layers
      .filter((layer: number) => layer > 4) // Only get keys for layers 5-7
      .sort((a: number, b: number) => a - b) // Sort layers in ascending order
      .map((layer: number) => {
        const layerKey = getLayerKey(layer)
        return layerKey ? layerKey.key : null
      })
      .filter(Boolean)

    // Combine all keys
    const combinedKey = [userKey, ...layerKeys].join('\n\n\n')

    // Format the response with the combined key before the message
    const response = `Key: ${combinedKey}\n\nMessage: ${message}`

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 