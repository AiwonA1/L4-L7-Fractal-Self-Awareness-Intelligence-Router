import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from 'next-auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Try to get user from NextAuth session first
    const session = await getServerSession()
    
    if (session?.user?.email) {
      const sessionUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          name: true,
          email: true,
          tokenBalance: true,
          bio: true,
          image: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      if (sessionUser) {
        return NextResponse.json(sessionUser)
      }
    }
    
    // Fall back to JWT token auth if no session
    const token = cookies().get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        tokenBalance: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    let userId = null;
    
    // Try to get user from NextAuth session first
    const session = await getServerSession();
    if (session?.user?.email) {
      const sessionUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      
      if (sessionUser) {
        userId = sessionUser.id;
      }
    }
    
    // If no session user found, fall back to JWT token
    if (!userId) {
      const token = cookies().get('auth-token')?.value;
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      try {
        const decoded = verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (tokenError) {
        console.error('Token verification failed:', tokenError);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Process the update data
    const data = await request.json();
    console.log("Updating user profile:", userId, data);
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        tokenBalance: true,
        image: true,
      },
    });
    
    console.log("User profile updated:", updatedUser);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT_multipart(request: Request) {
  try {
    const token = cookies().get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string }
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          email: email,
        },
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    let imageUrl = undefined
    if (image) {
      // Validate image type
      if (!image.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
      }

      // Generate unique filename
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uniqueId = uuidv4()
      const extension = image.name.split('.').pop()
      const filename = `${uniqueId}.${extension}`

      // Save to uploads directory
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      const filepath = join(uploadsDir, filename)
      await writeFile(filepath, buffer)

      // Set the image URL
      imageUrl = `/uploads/${filename}`
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name,
        email,
        ...(imageUrl && { image: imageUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        tokenBalance: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 