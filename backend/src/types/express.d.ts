import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

declare global {
	namespace Express {
		interface Request {
			user?: DecodedIdToken;
			file?: any;
			files?: any;
			// Add any other custom properties you use
		}
	}
}

export {};
