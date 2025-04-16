import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Process the uploaded file
    const formData = await request.formData()
    const image = formData.get('image') as File
    if (!image) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(image.type)) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueId = uuidv4()
    const extension = image.name.split('.').pop() || 'jpg'
    const filename = `${user.id}-${uniqueId}.${extension}`

    // Ensure directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file to directory
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Generate the public URL
    const imageUrl = `/uploads/avatars/${filename}`

    // Update user's image URL in database and Supabase
    await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl }
    })

    // Update user avatar in Supabase
    await supabase.auth.updateUser({
      data: { avatar_url: imageUrl }
    })

    // Return success with image URL
    return NextResponse.json({ 
      success: true,
      imageUrl,
      message: 'Profile image updated successfully'
    })
  } catch (error) {
    console.error('Error uploading profile image:', error)
    return NextResponse.json(
      { error: 'Failed to upload profile image' },
      { status: 500 }
    )
  }
} 