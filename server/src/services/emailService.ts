import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const EMAIL_FROM = process.env.EMAIL_FROM || '"Typing Battle Arena" <onboarding@resend.dev>';

const isSmtpConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS;

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

/**
 * Sends a verification email to a newly signed up user.
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const url = `${FRONTEND_URL}?mode=verify&token=${token}`;
  const subject = "⚔️ Verify Your Arena Account - Typing Battle Arena";
  const text = `Welcome to Typing Battle Arena! Please verify your email by clicking: ${url}`;
  const html = `
    <div style="background-color: #0d101c; color: #f8fafc; font-family: 'Outfit', sans-serif; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
      <h2 style="color: #00f2fe; text-align: center; font-size: 24px; margin-bottom: 20px;">WELCOME TO THE ARENA</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">
        Hello,
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">
        Thank you for signing up for the <strong>Typing Battle Arena</strong>. To start saving your ratings, custom reviews, and climb the global ladder, please verify your email address.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #00f2fe; color: #08090f; font-weight: 800; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 16px; display: inline-block; box-shadow: 0 0 15px rgba(0,242,254,0.4);">
          VERIFY ACCOUNT ➔
        </a>
      </div>
      <p style="font-size: 14px; color: #64748b; text-align: center;">
        If the button above does not work, copy and paste this URL into your browser:<br/>
        <a href="${url}" style="color: #00f2fe; text-decoration: underline;">${url}</a>
      </p>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;" />
      <p style="font-size: 12px; color: #475569; text-align: center;">
        If you did not sign up for this account, you can safely ignore this email.
      </p>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject,
      text,
      html,
    });
  } else {
    console.log("\n" + "=".repeat(60));
    console.log("📨 EMAIL SIMULATOR (SMTP not configured in server/.env)");
    console.log(`To:      ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link:    ${url}`);
    console.log("=".repeat(60) + "\n");
  }
}

/**
 * Sends a password reset email to a user.
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const url = `${FRONTEND_URL}?mode=reset&token=${token}`;
  const subject = "🔑 Reset Your Arena Password - Typing Battle Arena";
  const text = `Reset your password by clicking: ${url}`;
  const html = `
    <div style="background-color: #0d101c; color: #f8fafc; font-family: 'Outfit', sans-serif; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
      <h2 style="color: #ff0844; text-align: center; font-size: 24px; margin-bottom: 20px;">PASSWORD RESET REQUEST</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">
        Hello,
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">
        We received a request to reset the password for your <strong>Typing Battle Arena</strong> account. Click the button below to choose a new password.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #ff0844; color: #ffffff; font-weight: 800; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 16px; display: inline-block; box-shadow: 0 0 15px rgba(255,8,68,0.4);">
          RESET PASSWORD ➔
        </a>
      </div>
      <p style="font-size: 14px; color: #64748b; text-align: center;">
        If the button above does not work, copy and paste this URL into your browser:<br/>
        <a href="${url}" style="color: #ff0844; text-decoration: underline;">${url}</a>
      </p>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;" />
      <p style="font-size: 12px; color: #475569; text-align: center;">
        If you did not request this, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject,
      text,
      html,
    });
  } else {
    console.log("\n" + "=".repeat(60));
    console.log("📨 EMAIL SIMULATOR (SMTP not configured in server/.env)");
    console.log(`To:      ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link:    ${url}`);
    console.log("=".repeat(60) + "\n");
  }
}
