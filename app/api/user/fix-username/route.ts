import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get Supabase session
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

    // Update user's name to "Pru"
    await prisma.user.update({
      where: { email: session.user.email },
      data: { name: 'Pru' }
    })

    // Return HTML that updates localStorage and redirects
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Updating name...</title>
        </head>
        <body>
          <script>
            localStorage.setItem('userName', 'Pru');
            alert('Name updated successfully!');
            window.location.href = '/dashboard';
          </script>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('Error updating username:', error)
    return NextResponse.json(
      { error: 'Failed to update username. Please try again.' },
      { status: 500 }
    )
  }
} 