import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
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

    // Update user's image URL in database - this is correct as 'image' is the field name in User model
    await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl }
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