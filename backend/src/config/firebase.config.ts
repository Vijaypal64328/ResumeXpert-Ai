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
    
    // Try different service account key sources
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY; // can be base64 or raw JSON

    if (!serviceAccountPath && !serviceAccountRaw) {
        throw new Error('No Firebase service account credentials found. Set either FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY');
    }

    // Check if already initialized
    if (admin.apps.length === 0) {
        if (serviceAccountRaw) {
            // Allow raw JSON, base64-encoded JSON, and JSON with escaped newlines
            let jsonText = serviceAccountRaw.trim();
            try {
                // If it's base64, decode it; otherwise keep as-is
                const maybeDecoded = Buffer.from(jsonText, 'base64').toString('utf8');
                // Heuristic: decoded should start with '{' for JSON
                if (maybeDecoded.trim().startsWith('{')) {
                    jsonText = maybeDecoded;
                }
            } catch {
                // ignore, treat as raw
            }
            // Replace common escaped newline patterns
            jsonText = jsonText.replace(/\\n/g, '\n');
            let serviceAccount: any;
            try {
                serviceAccount = JSON.parse(jsonText);
            } catch (e) {
                throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON. Ensure it is valid JSON or base64 of JSON. Error: ${(e as Error).message}`);
            }
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            // Use service account file
            const resolvedPath = path.resolve(serviceAccountPath!);
            admin.initializeApp({
                credential: admin.credential.cert(resolvedPath)
            });
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