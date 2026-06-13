import admin from './firebase.js';
import User from '../models/user.model.js';

export const sendPushNotification = async (userId, title, body) => {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.fcmToken) {
      return;
    }

    const payload = {
      notification: {
        title,
        body
      },
      token: user.fcmToken
    };

    if (admin.apps.length > 0) {
      await admin.messaging().send(payload);
    }
  } catch (error) {
    console.error(`Error sending push notification to ${userId}:`, error);
  }
};
