// backend/config/firebaseAdmin.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT env variable is missing. Make sure it is set on the server.'
      );
    }

    // Parse the JSON stored in Render env var
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log(
      '🔥 Firebase Admin initialized successfully using environment variable.'
    );
  } catch (e) {
    console.error('❌ Firebase Admin initialization failed:', e);
    throw new Error(
      'Failed to initialize Firebase Admin SDK. Check FIREBASE_SERVICE_ACCOUNT value.'
    );
  }
}

export default admin;
