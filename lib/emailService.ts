import nodemailer from 'nodemailer'
import { sign } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from './supabase-admin'
import { sendEmail } from './sendEmail'
import { User, PasswordReset } from './types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(email: string) {
  try {
    // Create verification token
    const token = sign({ email }, JWT_SECRET, { expiresIn: '24h' })
    
    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`

    // Email content
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to FractiVerse Router!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending verification email:', error)
    return false
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.error('Error finding user:', userError)
      return { error: 'User not found' }
    }

    // Create password reset token
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    const { error: resetError } = await supabaseAdmin
      .from('password_resets')
      .insert([
        {
          user_id: user.id,
          token,
          expires_at: expires.toISOString()
        }
      ])

    if (resetError) {
      console.error('Error creating password reset:', resetError)
      return { error: 'Failed to create password reset' }
    }

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `
    })

    return { success: true }
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error)
    return { error: 'Internal server error' }
  }
}

async function createResetToken(email: string): Promise<string> {
  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  )

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Store token in database with expiration
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expires: new Date(Date.now() + 3600000) // 1 hour from now
    }
  })

  return token
} 