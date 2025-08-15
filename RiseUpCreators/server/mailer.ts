import nodemailer from "nodemailer";

// Ensure dotenv is loaded before checking environment variables
import { config } from "dotenv";
config({ path: ".env" });

const MAIL_FROM = process.env.MAIL_FROM || "stg.violin@gmail.com";

// Check if email configuration is available
const emailConfigAvailable = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
console.log('Email config check:', {
  SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Not set',
  SMTP_PASS: process.env.SMTP_PASS ? 'Set' : 'Not set',
  emailConfigAvailable
});

let transporter: nodemailer.Transporter | null = null;

if (emailConfigAvailable) {
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: false, // true for 465, false for other ports like 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Test the connection
  transporter.verify((error, success) => {
    if (error) {
      console.log('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to take our messages');
    }
  });

  console.log("Email transporter configured successfully");
} else {
  console.warn("Email configuration not found. Email functionality will be disabled.");
}

export async function sendOtpEmail(to: string, otp: string) {
  if (!transporter) {
    console.log(`[DEV MODE] OTP for ${to}: ${otp}`);
    return; // In development, just log the OTP instead of sending email
  }

  const mailOptions = {
    from: MAIL_FROM,
    to,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    html: `<p>Your OTP is: <b>${otp}</b></p><p>It will expire in 10 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
}