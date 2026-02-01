import nodemailer from "nodemailer";

// 1. Configure the Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 2. Define the Email Sender Function
export async function sendSecurityEmail(
  to: string,
  userName: string,
  type: 'LOCKED' | 'BLOCKED',
  siteName: string = "Trust Capital"
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const logoUrl = `${baseUrl}/logo.png`;

  try {
    const subject = type === 'LOCKED'
      ? `🚨 SECURITY ALERT: Account Locked - ${siteName}`
      : `⚠️ Security Warning: Suspicious Activity - ${siteName}`;

    // Define color/text based on type
    const color = type === 'LOCKED' ? '#d32f2f' : '#f57c00';
    const title = type === 'LOCKED' ? 'Account Security Alert' : 'Network Access Suspended';

    const content = type === 'LOCKED'
      ? `
        <p>Your account has been <strong>temporarily locked</strong> due to multiple failed login attempts.</p>
        <p><strong>Reason:</strong> Excessive Invalid Credentials detected.</p>
        <p>To restore access, please contact the bank administration or wait for an admin to review your case.</p>
      `
      : `
        <p>We detected unusual traffic from your network. Your IP address has been temporarily blocked for <strong>15 minutes</strong>.</p>
        <p>Please ensure you are using the correct password before trying again.</p>
      `;

    // Shared Template Structure
    const body = `
      <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${logoUrl}" alt="${siteName}" style="max-height: 40px; width: auto;" />
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
             <h2 style="color: ${color}; margin: 0; font-size: 22px;">${title}</h2>
          </div>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Dear ${userName},</p>

          <div style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            ${content}
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            This is an automated security notification from ${siteName}.<br/>
            If this was not you, please contact support immediately.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${siteName} Security" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: body,
    });

    console.log(`Security Email sent to ${to}`);
    return { success: true };

  } catch (error) {
    console.error("Email Failed:", error);
    return { success: false, error };
  }
}


export async function sendVerificationEmail(to: string, code: string, siteName: string = "Trust Capital") {
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const logoUrl = `${baseUrl}/logo.png`;

  try {
    await transporter.sendMail({
      from: `"${siteName} Security" <${process.env.SMTP_USER}>`,
      to,
      subject: "🔐 Verify Your Account",
      html: `
        <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

            <div style="text-align: center; margin-bottom: 24px;">
              <img src="${logoUrl}" alt="${siteName}" style="max-height: 40px; width: auto;" />
            </div>

            <h2 style="color: #111827; margin-top: 0; font-size: 24px; text-align: center;">Verify Your Account</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; text-align: center;">
              Welcome to <strong>${siteName}</strong>. Please use the verification code below to activate your secure account.
            </p>

            <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <span style="display: block; font-size: 14px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</span>
              <span style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 6px; font-family: monospace;">${code}</span>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              This code expires in 15 minutes.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              If you didn't create an account with ${siteName}, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("OTP Email Failed:", error);
    return { success: false };
  }
}

export async function sendPasswordResetEmail(to: string, token: string, siteName: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password/${token}`;
  const logoUrl = `${baseUrl}/logo.png`;

  try {
    await transporter.sendMail({
      from: `"${siteName} Security" <${process.env.SMTP_USER}>`,
      to,
      subject: "🔑 Reset Your Password",
      html: `
        <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

            <div style="text-align: center; margin-bottom: 24px;">
              <img src="${logoUrl}" alt="${siteName}" style="max-height: 40px; width: auto;" />
            </div>

            <h2 style="color: #111827; margin-top: 0; font-size: 20px; text-align: center;">Password Reset Request</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Hello,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              We received a request to reset the password for your <strong>${siteName}</strong> account.
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Click the button below to set a new password. This link expires in 1 hour.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Or copy this link:</p>
            <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${resetLink}</p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              If you didn't ask for this, you can safely ignore this email. Your account remains secure.
            </p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Reset Email Failed:", error);
    return { success: false };
  }
}