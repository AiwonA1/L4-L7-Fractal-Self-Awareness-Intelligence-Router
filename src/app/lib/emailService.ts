import nodemailer from 'nodemailer'
import { sign } from 'jsonwebtoken'
import { supabaseAdmin } from '@/app/lib/supabase/supabase-admin' // Use absolute path
import { sendEmail } from '@/app/lib/sendEmail' // Use absolute path

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(email: string): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.JWT_SECRET) {
      console.error("SMTP or JWT_SECRET not configured for verification email.");
      return false;
  }
  try {
    const token = sign({ email }, JWT_SECRET, { expiresIn: '24h' })
    const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/api/auth/verify?token=${token}`

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verify your email address for FractiVerse',
      html: `
        <h1>Welcome to FractiVerse!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    }
    await transporter.sendMail(mailOptions)
    console.log(`Verification email sent to ${email}`);
    return true
  } catch (error) {
    console.error('Error sending verification email:', error)
    return false
  }
}

export async function sendPasswordResetEmail(email: string): Promise<{ success?: boolean; error?: string }> {
    if (!process.env.SMTP_HOST) {
        console.error("SMTP not configured for password reset email.");
        return { error: "Email service not configured." };
    }
  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.warn('Password reset requested for non-existent user or DB error:', email, userError?.message)
      // Return success-like to prevent user enumeration
      return { success: true } 
    }

    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 3600000) // 1 hour

    const { error: resetError } = await supabaseAdmin
      .from('password_resets')
      .insert({ user_id: user.id, token, expires_at: expires.toISOString() })

    if (resetError) {
      console.error('Error creating password reset entry:', resetError)
      return { error: 'Failed to initiate password reset. Please try again later.' }
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${token}`
    const emailResult = await sendEmail({
      to: email,
      subject: 'Reset your password for FractiVerse',
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    })

    if (emailResult.error) {
        console.error("Failed to send password reset email:", emailResult.error);
        return { error: "Failed to send password reset email." } 
    }
    
    console.log(`Password reset email sent to ${email}`);
    return { success: true }

  } catch (error) {
    console.error('Error in sendPasswordResetEmail function:', error)
    return { error: 'An internal error occurred. Please try again later.' }
  }
} 