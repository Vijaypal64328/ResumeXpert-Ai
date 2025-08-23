import { Request } from 'express';
import admin from 'firebase-admin';

declare module 'express-serve-static-core' {
	interface Request {
		user?: admin.auth.DecodedIdToken;
		file?: Express.Multer.File;
		// Add any other custom properties here
	}
}
