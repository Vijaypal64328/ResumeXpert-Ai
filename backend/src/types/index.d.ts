// Type declarations for modules that might be missing types

declare module 'express' {
    import express from 'express';
    export = express;
}

declare module 'cors' {
    import cors from 'cors';
    export = cors;
}

declare module 'multer' {
    import multer from 'multer';
    export = multer;
}

declare module 'pdf-parse' {
    function pdfParse(buffer: Buffer): Promise<any>;
    export = pdfParse;
}

declare module 'mammoth' {
    export function extractRawText(options: any): Promise<any>;
}

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: any;
            file?: any;
        }
    }
}

// Custom Request interface if needed
interface CustomRequest extends Express.Request {
    user?: any;
    file?: any;
}
