import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uniqueId = uuidv4()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const filename = `${uniqueId}.${extension}`

    // Save to uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Return the file URL
    const fileUrl = `/uploads/${filename}`
    return NextResponse.json({ 
      url: fileUrl,
      filename: originalName,
      type: file.type
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
} 