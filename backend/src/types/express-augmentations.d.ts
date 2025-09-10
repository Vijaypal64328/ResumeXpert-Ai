import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

declare module 'express-serve-static-core' {
	interface Request {
		user?: DecodedIdToken;
		file?: any;
		files?: any;
		// Add any other custom properties you use
	}
}
