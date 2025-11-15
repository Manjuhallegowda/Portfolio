// backend/config/firebaseAdmin.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';

if (!admin.apps.length) {
  try {
    const saPath = path.resolve(process.cwd(), 'service-account.json');
    const serviceAccount = JSON.parse(readFileSync(saPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log('Firebase Admin initialized successfully from service-account.json.');
  } catch (e) {
    console.error('Firebase Admin initialization failed:', e);
    throw new Error('Failed to initialize Firebase Admin SDK. Make sure service-account.json is present and valid in the backend directory.');
  }
}

export default admin;
