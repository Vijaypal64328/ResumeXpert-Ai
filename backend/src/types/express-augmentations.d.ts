declare global {
  namespace Express {
    interface Request {
      user?: any; // DecodedIdToken or custom payload assigned by auth middleware
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

export {};