import dotenv from "dotenv";
import Razorpay from "razorpay";
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { BrevoClient } from '@getbrevo/brevo';

dotenv.config(
  {
    path: "./.env"
  }
)

console.log("brevo", process.env.BREVO_API_KEY)




export const brevo = new BrevoClient(
  {
    headers: {
      api_Key: process.env.BREVO_API_KEY

    }
  }





);




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

