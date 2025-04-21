import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const session = await supabase.auth.getSession()
    
    if (!session.data.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(session.data.session.user.id)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('profile-images')
      .upload(`${user.id}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('profile-images')
      .getPublicUrl(uploadData.path)

    // Update user profile with new image URL
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ image: publicUrl })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 