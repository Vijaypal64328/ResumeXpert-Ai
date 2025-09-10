import request from 'supertest';
import path from 'path';
import fs from 'fs';

// --- Mock Dependencies FIRST (before importing app) ---

// Mock firebase-admin (Firestore) with FieldValue on the firestore function (static),
// matching usage of admin.firestore.FieldValue in controllers.
const mockAdd = jest.fn();
const mockCollection = jest.fn(() => ({ add: mockAdd }));

interface FirestoreMock extends jest.Mock {
    FieldValue?: { serverTimestamp: () => Date };
}

const firestoreMockFn: FirestoreMock = jest.fn(() => ({
    collection: mockCollection,
})) as any;
firestoreMockFn.FieldValue = { serverTimestamp: jest.fn(() => new Date()) };

jest.mock('firebase-admin', () => {
    const actualFirebase = jest.requireActual('firebase-admin');
    return {
        initializeApp: jest.fn(),
        credential: actualFirebase.credential,
        firestore: firestoreMockFn,
        auth: jest.fn(() => ({})),
    };
});

// Mock middleware/auth.middleware
jest.mock('../middleware/auth.middleware', () => ({
    authenticateToken: jest.fn((req, res, next) => {
        req.user = { uid: 'test-user-id-456', email: 'authed@example.com' };
        next();
    })
}));

// Mock pdf-parse
const mockPdfParse = jest.fn();
jest.mock('pdf-parse', () => mockPdfParse);

// Mock mammoth
const mockMammothExtract = jest.fn();
jest.mock('mammoth', () => ({ extractRawText: mockMammothExtract }));

// Now import items that rely on the mocks
import app from '../server';
import { authenticateToken } from '../middleware/auth.middleware';

// --- Test Suite ---

describe('POST /api/resumes/upload', () => {

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Reset specific mock implementations if needed for default behavior
        (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
            req.user = { uid: 'test-user-id-456', email: 'authed@example.com' };
            next();
        });
    mockPdfParse.mockResolvedValue({ text: 'Parsed PDF Text Content' } as any);
        mockMammothExtract.mockResolvedValue({ value: 'Parsed DOCX Text Content' });
        mockAdd.mockResolvedValue({ id: 'new-resume-doc-id' }); // Simulate successful Firestore add
    });

    // Temporarily add a simple test
    // it('should run a basic test within the suite', () => {
    //     expect(true).toBe(true);
    // });

    // Restore original tests 
    it('should upload, parse, and save a PDF file successfully', async () => {
        // Arrange
        // const filePath = path.join(__dirname, 'dummy.pdf'); // Don't need actual file path for buffer
        const fileBuffer = Buffer.from('%PDF-1.0 fake content', 'utf-8');

        // Act
        const response = await request(app)
            .post('/api/resumes/upload')
            .attach('resumeFile', fileBuffer, 'test.pdf'); // Use buffer

        // Assert
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            message: 'Resume uploaded and parsed successfully',
            resumeId: 'new-resume-doc-id'
        });
        expect(authenticateToken).toHaveBeenCalledTimes(1); // Verify auth middleware was called
        expect(mockPdfParse).toHaveBeenCalledTimes(1);
        expect(mockMammothExtract).not.toHaveBeenCalled();
        expect(mockCollection).toHaveBeenCalledWith('resumes');
        expect(mockAdd).toHaveBeenCalledTimes(1);
        expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'test-user-id-456',
            originalFilename: 'test.pdf',
            parsedText: 'Parsed PDF Text Content',
            uploadTimestamp: expect.any(Date)
        }));
    });

    it('should upload, parse, and save a DOCX file successfully', async () => {
        // Arrange
        const fileBuffer = Buffer.from('Fake DOCX content', 'utf-8');

        // Act
        const response = await request(app)
            .post('/api/resumes/upload')
            .attach('resumeFile', fileBuffer, {
                filename: 'test.docx',
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }); // Need to specify contentType for docx

        // Assert
        expect(response.statusCode).toBe(201);
        expect(response.body.resumeId).toBe('new-resume-doc-id');
        expect(authenticateToken).toHaveBeenCalledTimes(1);
        expect(mockMammothExtract).toHaveBeenCalledTimes(1);
        expect(mockPdfParse).not.toHaveBeenCalled();
        expect(mockCollection).toHaveBeenCalledWith('resumes');
        expect(mockAdd).toHaveBeenCalledTimes(1);
        expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'test-user-id-456',
            originalFilename: 'test.docx',
            parsedText: 'Parsed DOCX Text Content'
        }));
    });

    it('should return 401 if user is not authenticated', async () => {
        // Arrange: Modify the auth mock to simulate failure
        (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
            res.status(401).json({ message: 'Unauthorized: Mock Failure' });
            // Do not call next()
        });
        const fileBuffer = Buffer.from('%PDF-1.0 fake content', 'utf-8');

        // Act
        const response = await request(app)
            .post('/api/resumes/upload')
            .attach('resumeFile', fileBuffer, 'test.pdf');

        // Assert
        expect(response.statusCode).toBe(401);
        expect(authenticateToken).toHaveBeenCalledTimes(1);
        expect(mockAdd).not.toHaveBeenCalled(); // Verify Firestore was not called
    });

    it('should return 400 if no file is uploaded', async () => {
        // Act: Send request without attaching a file
        const response = await request(app)
            .post('/api/resumes/upload');
        // .send(); // No file attached

        // Assert
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/No file uploaded/i);
        expect(authenticateToken).toHaveBeenCalledTimes(1); // Auth runs first
        expect(mockAdd).not.toHaveBeenCalled();
    });

    it('should return 400 for unsupported file type (e.g., txt)', async () => {
        // Arrange
        const fileBuffer = Buffer.from('Plain text file', 'utf-8');

        // Act
        const response = await request(app)
            .post('/api/resumes/upload')
            .attach('resumeFile', fileBuffer, { filename: 'test.txt', contentType: 'text/plain' });

        // Assert
        // Check if multer filter error is handled or controller handles it
        // Expect 400 based on current controller logic
        expect(response.statusCode).toBe(400);
        // The exact message depends on where the error is caught (multer vs controller)
        // Let's check for common wordings
        expect(response.body.message).toMatch(/(Invalid file type|Unsupported file type)/i);
        expect(authenticateToken).toHaveBeenCalledTimes(1);
        expect(mockAdd).not.toHaveBeenCalled();
    });

    it('should return 500 if PDF parsing fails', async () => {
        // Arrange
        mockPdfParse.mockRejectedValue(new Error('Mock PDF Parsing Error'));
        const fileBuffer = Buffer.from('%PDF-1.0 fake content', 'utf-8');

        // Act
        const response = await request(app)
            .post('/api/resumes/upload')
            .attach('resumeFile', fileBuffer, 'test.pdf');

        // Assert
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toMatch(/Internal server error during resume processing/i);
        expect(mockPdfParse).toHaveBeenCalledTimes(1);
        expect(mockAdd).not.toHaveBeenCalled();
    });

    it('should return 500 if Firestore saving fails', async () => {
        // Arrange
        mockAdd.mockRejectedValue(new Error('Mock Firestore Error'));
        const fileBuffer = Buffer.from('%PDF-1.0 fake content', 'utf-8');

        // Act
        const response = await request(app)
            .post('/api/resumes/upload')
            .attach('resumeFile', fileBuffer, 'test.pdf');

        // Assert
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toMatch(/Internal server error during resume processing/i);
        // Parsing should still happen before saving fails
        expect(mockPdfParse).toHaveBeenCalledTimes(1);
        expect(mockAdd).toHaveBeenCalledTimes(1);
    });

}); 