import { prisma } from './db'

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    return user
  } catch (error) {
    console.error('Profile error:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<{
  name: string | null
  image: string | null
  email: string
  fract_tokens: number | null
  tokens_used: number | null
  token_balance: number | null
}>) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updates
    })
    return user
  } catch (error) {
    console.error('Update error:', error)
    return null
  }
} 