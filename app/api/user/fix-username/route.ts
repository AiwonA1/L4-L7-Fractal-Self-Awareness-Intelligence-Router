import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Set name to "Pru" specifically
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Pru' },
      select: { id: true, name: true, email: true }
    })
    
    // Update localStorage via client-side script
    const html = `
      <html>
        <head>
          <title>Username Fixed</title>
          <script>
            // Save name to localStorage for persistent display
            localStorage.setItem('userName', 'Pru');
            localStorage.setItem('userData', JSON.stringify({
              id: "${updatedUser.id}",
              name: "Pru",
              email: "${updatedUser.email}"
            }));
            
            // Show success message
            document.addEventListener('DOMContentLoaded', function() {
              document.getElementById('message').textContent = 'Your name has been set to "Pru". Redirecting...';
              // Redirect back to dashboard
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 2000);
            });
          </script>
        </head>
        <body>
          <h1 id="message">Processing...</h1>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('Error fixing username:', error)
    return NextResponse.json({ error: 'Failed to fix username' }, { status: 500 })
  }
} 