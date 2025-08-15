import bcrypt from "bcrypt";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { sendOtpEmail } from "./mailer";
import { User } from "../shared/schema"; // Adjust path if needed

const SALT_ROUNDS = 10;

// Extend express-session to include OTP fields
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userType?: string;
    username?: string;
    email?: string;
    otpEmail?: string; // no null — undefined means not set
    otp?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    userType: string;
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = {
    id: req.session.userId,
    email: req.session.email || "",
    username: req.session.username || "",
    userType: req.session.userType || "fan",
  };

  next();
}

export function requireCreator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId || req.session?.userType !== "creator") {
    return res.status(403).json({ message: "Creator access required" });
  }

  req.user = {
    id: req.session.userId,
    email: req.session.email || "",
    username: req.session.username || "",
    userType: req.session.userType,
  };

  next();
}

/* ---------------- OTP HANDLERS ---------------- */
export async function sendPasswordOtp(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = crypto.randomInt(100000, 999999).toString();

  // Store OTP in session
  req.session.otpEmail = email;
  req.session.otp = otp;

  try {
    await sendOtpEmail(email, otp);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}

export function verifyPasswordOtp(req: Request, res: Response) {
  const { email, otp } = req.body;

  if (req.session.otpEmail !== email) {
    return res.status(400).json({ message: "OTP not requested for this email" });
  }
  if (req.session.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  return res.json({ message: "OTP verified" });
}

export async function resetPasswordWithOtp(req: Request, res: Response) {
  const { email, otp, newPassword } = req.body;

  if (req.session.otpEmail !== email) {
    return res.status(400).json({ message: "OTP not requested for this email" });
  }
  if (req.session.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  try {
    const hashed = await hashPassword(newPassword);

    await User.updateOne(
      { email },
      { $set: { password: hashed } }
    );

    // Clear OTP by setting undefined
    req.session.otpEmail = undefined;
    req.session.otp = undefined;

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
}
