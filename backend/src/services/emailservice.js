import { brevo } from "../config/services.js";


export const sendOtpEmail = async (toEmail, otpCode) => {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!senderEmail) {
    throw new Error('BREVO_SENDER_EMAIL is not set');
  }

  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: "Your Grocify OTP Code",
      htmlContent: `<p>Your verification code is: <strong>${otpCode}</strong></p>`,
      sender: { name: "Grocify", email: senderEmail },
      to: [{ email: toEmail }],
    });
    console.log('OTP email sent via Brevo:', result.messageId);
  } catch (error) {
    console.error('Brevo API error:', error.body || error.message);
    throw error;
  }
};