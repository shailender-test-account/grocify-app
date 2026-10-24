import Razorpay from "razorpay";

import { initializeApp, getApps, cert } from "firebase-admin/app"

import dotenv from "dotenv";
import nodemailer from "nodemailer"

dotenv.config(
  {
    path:"./.env"
  }
)


export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.APP_PASSWORD, // Use app password, not your regular password
  },
})


// export const resend = new Resend(`${process.env.RESEND_KEY}`);

export const razorpay = new Razorpay({
  key_id: process.env.RAZ_API_KEY,
  key_secret: process.env.RAZ_API_SECRET,
});





if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

