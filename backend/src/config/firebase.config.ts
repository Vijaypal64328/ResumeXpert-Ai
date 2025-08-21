import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

// Ensure env vars are loaded
dotenv.config();

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

try {
    logger.info('[firebase-config]: Attempting Firebase Admin SDK initialization...');
    
    // Check if already initialized (useful for hot-reloading environments)
    if (admin.apps.length === 0) {
        // Try to use FIREBASE_SERVICE_ACCOUNT_KEY first (for Render deployment)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            logger.info('[firebase-config]: Firebase Admin SDK initialized with service account key.');
        } 
        // Fall back to GOOGLE_APPLICATION_CREDENTIALS (for local development)
        else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            const resolvedPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
            admin.initializeApp({
                credential: admin.credential.cert(resolvedPath)
            });
            logger.info('[firebase-config]: Firebase Admin SDK initialized with credentials file.');
        } 
        else {
            throw new Error('Neither FIREBASE_SERVICE_ACCOUNT_KEY nor GOOGLE_APPLICATION_CREDENTIALS environment variable is set.');
        }
    } else {
        logger.info('[firebase-config]: Firebase Admin SDK already initialized.');
    }

    // Get the initialized services
    db = admin.firestore();
    auth = admin.auth();

} catch (error) {
    logger.error('[firebase-config]: FATAL Error initializing Firebase Admin SDK:', error);
    // Optional: Rethrow or exit to prevent the app from starting in a broken state
    throw error;
}

// Export the initialized services
export { db, auth };