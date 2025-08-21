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
        // Option 1: Use Base64 encoded service account (preferred for Render)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            logger.info('[firebase-config]: Using Base64 service account...');
            const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
            const serviceAccount = JSON.parse(serviceAccountJson);
            
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        // Option 2: Use file path (for local development)
        else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            logger.info('[firebase-config]: Using service account file path...');
            const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            const resolvedPath = path.resolve(serviceAccountPath);
            
            admin.initializeApp({
                credential: admin.credential.cert(resolvedPath)
            });
        }
        // No credentials found
        else {
            throw new Error('Neither FIREBASE_SERVICE_ACCOUNT_BASE64 nor GOOGLE_APPLICATION_CREDENTIALS environment variable is set.');
        }
        
        logger.info('[firebase-config]: Firebase Admin SDK initialized successfully.');
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