import { transporter } from "../config/services.js";

export const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Grocify" <${process.env.GMAIL_USER}>`, // Sender display name
    to: toEmail, // Any user's email
    subject: 'Your Grocify Registration OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Grocify!</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};