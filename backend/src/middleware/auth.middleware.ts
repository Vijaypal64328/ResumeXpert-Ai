import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { CustomRequest } from '../types/index';
import admin from 'firebase-admin';
import logger from '../utils/logger';

export const authenticateToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach decoded user info to the request object
            logger.info(`[auth]: User authenticated: ${decodedToken.uid}`);
        next(); // Proceed to the next middleware or route handler
    } catch (error: unknown) {
        if (error instanceof Error) {
                logger.error("[auth]: Token verification failed:", error.message);
            const err = error as { code?: string; message: string };
            if (err.code === 'auth/id-token-expired') {
                res.status(401).json({ message: 'Unauthorized: Token expired' });
            } else {
                res.status(401).json({ message: 'Unauthorized: Token verification failed', error: err.message });
            }
        }
    }
}; 

// Export authenticateToken as requireAuth for consistency across the codebase
export const requireAuth = authenticateToken; 