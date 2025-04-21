import nodemailer from 'nodemailer'
import { sign } from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase/supabase-admin' // Use absolute path
import { sendEmail } from '@/lib/sendEmail' // Use absolute path

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

// NOTE: This custom verification flow is discouraged.
// Recommend using Supabase built-in email confirmation.
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

// NOTE: Custom password reset logic removed.
// The application now uses the standard Supabase reset flow via
// /api/auth/forgot-password which calls supabase.auth.resetPasswordForEmail.
// The corresponding /api/auth/reset-password route should also be removed.
/*
export async function sendPasswordResetEmail(email: string): Promise<{ success?: boolean; error?: string }> {
    // ... removed custom logic ...
}
*/ 