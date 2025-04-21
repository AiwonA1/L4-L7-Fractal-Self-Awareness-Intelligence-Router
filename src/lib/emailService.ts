import nodemailer from 'nodemailer'
// Remove JWT import as it's no longer needed for custom verification
// import { sign } from 'jsonwebtoken' 
import { supabaseAdmin } from '@/lib/supabase/supabase-admin' // Use absolute path
import { sendEmail } from '@/lib/sendEmail' // Use absolute path

// Remove JWT_SECRET as it's no longer needed
// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' 

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

// NOTE: Custom email verification logic removed.
// Supabase built-in email confirmation is now used via the emailRedirectTo 
// option in the signUp call (e.g., in SignupForm.tsx).
/*
export async function sendVerificationEmail(email: string): Promise<boolean> {
    // ... removed custom logic ...
}
*/

// NOTE: Custom password reset logic removed.
// The application now uses the standard Supabase reset flow via
// /api/auth/forgot-password which calls supabase.auth.resetPasswordForEmail.
/*
export async function sendPasswordResetEmail(email: string): Promise<{ success?: boolean; error?: string }> {
    // ... removed custom logic ...
}
*/ 