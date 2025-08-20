// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: any;
            file?: any;
        }
    }
}

// Export to make this a module
export {};
