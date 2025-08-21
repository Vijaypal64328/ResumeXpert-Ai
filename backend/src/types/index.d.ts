// Type declarations for Express extensions
declare global {
    namespace Express {
        interface Request {
            user?: any;
            file?: any;
        }
        
        namespace Multer {
            interface File {
                fieldname: string;
                originalname: string;
                encoding: string;
                mimetype: string;
                size: number;
                destination: string;
                filename: string;
                path: string;
                buffer: Buffer;
            }
        }
    }
}

// Custom Request interface that extends Express.Request
export interface CustomRequest extends Express.Request {
    user?: any;
    file?: Express.Multer.File;
    body: any;
    params: any;
    headers: any;
}

// Export to make this a module
export {};
