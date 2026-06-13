import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// To use this in production, you MUST provide the serviceAccountKey.json
// or configure it via environment variables on Render.
try {
  // Option 1: Using a local JSON file (uncomment and place file in root)
  // import serviceAccount from '../serviceAccountKey.json' assert { type: "json" };
  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount)
  // });

  // Option 2: Using Environment Variables (Recommended for Render)
  // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount)
  // });
  
  ");
} catch (error) {
  console.error("Firebase Admin Initialization Error:", error);
}

export default admin;
