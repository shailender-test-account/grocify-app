import { firebaseAdmin } from "../config/services.js";



export const sendPushNotification = async (fcmToken, title, body) => {
  if (!fcmToken) return;
  try {
    await firebaseAdmin.send({
      token: fcmToken,
      notification: { title, body },
    });
  } catch (error) {
    console.error('Firebase Push Notification Error:', error.message);
  }
};