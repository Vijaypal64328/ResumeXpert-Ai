declare global {
  namespace Express {
    interface Request {
      user?: any;
      // Use loose any types to avoid depending on @types/multer during prod builds
      file?: any;
      files?: any;
    }
  }
}

export {};