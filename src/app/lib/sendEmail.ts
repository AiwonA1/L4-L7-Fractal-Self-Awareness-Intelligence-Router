import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<{ success?: boolean; error?: string }> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP configuration missing in environment variables.");
      return { error: "Email service is not configured." };
  }
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587, // Default port if not specified
    secure: process.env.SMTP_SECURE === 'true', // Use true for port 465, false for others
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER, // Use sender email if FROM not set
    to,
    subject,
    html
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent: ' + info.response);
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { error: `Failed to send email: ${error instanceof Error ? error.message : String(error)}` }
  }
} 