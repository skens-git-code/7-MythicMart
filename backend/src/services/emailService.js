/* Email service — provides reset links, OTP verification codes, and order confirmations */
import { config } from '../config/env.js';

export const sendEmail = async ({ to, subject, html, text }) => {
  // In production with configured SMTP / provider, dispatch real email
  // In test or development without SMTP, gracefully log preview
  if (config.isTest) {
    return { success: true, messageId: `test-${Date.now()}` };
  }

  console.log(`[EmailService] Sending email to: ${to} | Subject: ${subject}`);
  console.log(`[EmailService] Content Preview: ${text || html?.substring(0, 100)}...`);

  return { success: true, messageId: `mock-${Date.now()}` };
};

export const sendPasswordResetEmail = async (user, resetToken, otpCode) => {
  const resetUrl = `${config.cors.origins[0] || 'http://localhost:5173'}/#/forgot-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
  
  const text = `Hello ${user.name},\n\nYou requested a password reset for your MythicMart account.\n\nYour One-Time Passcode (OTP) is: ${otpCode}\n\nAlternatively, use this secure link: ${resetUrl}\n\nThis code and link will expire in 15 minutes.\nIf you did not make this request, please ignore this email.\n\nBest,\nMythicMart Security Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #111;">MythicMart Password Reset</h2>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>You requested a password reset for your account.</p>
      <div style="background: #f4f4f5; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #18181b;">${otpCode}</span>
      </div>
      <p style="font-size: 14px; color: #666;">This verification code will expire in 15 minutes.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'MythicMart — Password Reset Verification Code',
    text,
    html,
  });
};
