import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
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