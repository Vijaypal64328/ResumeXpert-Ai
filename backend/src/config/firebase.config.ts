import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

// Ensure env vars are loaded
dotenv.config();

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

const isTest = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

try {
    logger.info('[firebase-config]: Attempting Firebase Admin SDK initialization...');

    if (!isTest) {
        // In non-test environments, require credentials
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
        const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (!serviceAccountPath && !serviceAccountBase64) {
            throw new Error('No Firebase service account credentials found. Set either FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY');
        }

    const apps = (admin as any).apps || [];
    if (apps.length === 0) {
            if (serviceAccountBase64) {
                const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString());
                admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            } else {
                const resolvedPath = path.resolve(serviceAccountPath!);
                admin.initializeApp({ credential: admin.credential.cert(resolvedPath) });
            }
            logger.info('[firebase-config]: Firebase Admin SDK initialized successfully.');
        } else {
            logger.info('[firebase-config]: Firebase Admin SDK already initialized.');
        }
    } else {
        // In test environment, rely on jest mocks for firebase-admin; don't require real credentials
    const apps = (admin as any).apps || [];
    if (apps.length === 0) {
            try {
                admin.initializeApp({} as any);
            } catch {
                // ignore if mocked initializeApp has specific signature
            }
        }
        logger.info('[firebase-config]: Test environment detected; using mocked Firebase Admin.');
    }

    // Obtain services (mocked in tests)
    db = admin.firestore();
    auth = admin.auth();

} catch (error) {
    logger.error('[firebase-config]: FATAL Error initializing Firebase Admin SDK:', error);
    if (!isTest) {
        // Only rethrow outside tests
        throw error;
    } else {
        // In tests, provide minimal fallbacks to avoid crashes
        db = ({} as unknown) as admin.firestore.Firestore;
        auth = ({} as unknown) as admin.auth.Auth;
    }
}

export { db, auth };