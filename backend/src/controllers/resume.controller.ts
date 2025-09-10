import { Request, Response } from 'express';
import { AxiosError } from 'axios';

interface ApiError extends Error {
    code?: string;
    status?: string | number;
    response?: {
        status?: string | number;
        data?: { message?: string; };
    };
}

interface ResumeAnalysisResult {
    overallScore?: number;
    categoryScores?: {
        formatting?: number;
        content?: number;
        keywords?: number;
        impact?: number;
        [key: string]: number | undefined;
    };
    suggestions?: string[];
    strengths?: string[];
    skills?: string[];
    experience?: string[];
    education?: string[];
    summary?: string;
    // Add other properties as they become clear from AI response structure
}
// import admin from 'firebase-admin'; // Keep for FieldValue type
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Resume } from '../models/resume.model';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
// Import initialized db from config
import { db } from '../config/firebase.config';
import admin from 'firebase-admin'; // Still needed for admin.firestore.FieldValue
import logger from '../utils/logger';
import { generateContentWithRetry, tryMultipleModels } from '../utils/aiHelpers';
import { analyzeResumeAI } from '../utils/highQuotaAI';

interface CustomRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

// const db = admin.firestore(); // Removed: Use imported db

// Initialize Google Generative AI 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Old model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Use current recommended model

// Placeholder for uploadResume function
export const uploadResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        // If user is not authenticated, assign a generic or null userId
        const userId = req.user ? req.user.uid : 'anonymous';

        // Check if a file was uploaded by multer
        if (!req.file) {
            console.error('[upload]: No file uploaded. Multer req.file is undefined.');
            res.status(400).json({ message: 'Bad Request: No file uploaded' });
            return;
        }

        const file = req.file;
        let parsedText = '';

        console.log(`[upload]: Processing file: ${file.originalname}, Type: ${file.mimetype}, Size: ${file.size} bytes`);

        // Parse based on mimetype
        if (file.mimetype === 'application/pdf') {
            try {
                const data = await pdfParse(file.buffer);
                parsedText = data.text;
                console.log(`[upload]: PDF parsed successfully.`);
            } catch (pdfErr) {
                console.error('[upload]: Error parsing PDF:', pdfErr);
                res.status(500).json({ message: 'Error parsing PDF file', error: pdfErr instanceof Error ? pdfErr.message : pdfErr });
                return;
            }
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            try {
                const { value } = await mammoth.extractRawText({ buffer: file.buffer });
                parsedText = value;
                console.log(`[upload]: DOCX parsed successfully.`);
            } catch (docxErr) {
                console.error('[upload]: Error parsing DOCX:', docxErr);
                res.status(500).json({ message: 'Error parsing DOCX file', error: docxErr instanceof Error ? docxErr.message : docxErr });
                return;
            }
        } else {
            // This case should ideally be prevented by multer's fileFilter, but handle defensively
            console.error(`[upload]: Unsupported file type: ${file.mimetype}`);
            res.status(400).json({ message: 'Unsupported file type' });
            return;
        }

        // Create Resume data object
        const resumeData: Omit<Resume, 'id'> = {
            userId: userId,
            originalFilename: file.originalname,
            parsedText: parsedText,
            uploadTimestamp: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
            // analysis field will be added later in Phase 3
        };

        // Use imported db service
        try {
            // Create document ref first so we can include an ID in the storage path
            const resumeRef = db.collection('resumes').doc();
            const resumeId = resumeRef.id;

            // Attempt to upload original file to Firebase Storage if bucket is configured
            let storagePath: string | undefined = undefined;
            try {
                const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
                const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
                storagePath = `resumes/${userId}/${resumeId}/${Date.now()}_${file.originalname}`;
                const fileHandle = bucket.file(storagePath);
                await fileHandle.save(file.buffer, { metadata: { contentType: file.mimetype } });
                console.log(`[upload]: Uploaded original file to storage at ${storagePath}`);
            } catch (storageErr) {
                console.warn('[upload]: Failed to upload original file to Firebase Storage; continuing without storagePath', storageErr instanceof Error ? storageErr.message : storageErr);
                storagePath = undefined;
            }

            // Attach storagePath if available
            if (storagePath) resumeData.storagePath = storagePath;

            // Persist resume data
            await resumeRef.set(resumeData);
            console.log(`[upload]: Resume data saved to Firestore with ID: ${resumeRef.id}`);

            // Respond with the ID of the newly created resume document
            res.status(201).json({ message: 'Resume uploaded and parsed successfully', resumeId: resumeRef.id });
        } catch (dbErr) {
            console.error('[upload]: Error saving resume to Firestore:', dbErr);
            res.status(500).json({ message: 'Error saving resume to database', error: dbErr instanceof Error ? dbErr.message : dbErr });
        }

    } catch (error: unknown) {
        console.error('[upload]: Unexpected error in uploadResume:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Internal server error during resume processing', error: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error during resume processing', error });
        }
    }
};

// --- Analyze Resume Function ---
export const analyzeResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user ? req.user.uid : 'anonymous';
        const { resumeId } = req.params;

        if (!resumeId) {
            res.status(400).json({ message: 'Bad Request: Missing resumeId parameter' });
            return;
        }

        // Use imported db service
        const resumeRef = db.collection('resumes').doc(resumeId);
        const resumeDoc = await resumeRef.get();

        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }

        const resumeData = resumeDoc.data() as Resume;

        // Debug log for ownership check
        console.log(`[analyze][ownership] resumeData.userId: ${resumeData.userId}, req.user.uid: ${userId}`);
        // Verify ownership, allowing anonymous users to analyze anonymously uploaded resumes
        if (resumeData.userId !== userId && !(resumeData.userId === 'anonymous' && userId === 'anonymous')) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume', resumeUserId: resumeData.userId, requestUserId: userId });
            return;
        }

        if (!resumeData.parsedText || resumeData.parsedText.trim() === '') {
            res.status(400).json({ message: 'Cannot analyze empty resume text' });
            return;
        }

        console.log(`[analyze]: Starting analysis for resume: ${resumeId}, User: ${userId}`);

        // --- Prepare Prompt for Gemini --- (Aligned with frontend ResumeAnalysis interface)
        const prompt = `
          Analyze the following resume text and provide feedback. Structure your response as a JSON object adhering STRICTLY to the following format:
          {
            "overallScore": <integer score 0-100>,
            "categoryScores": {
              "formatting": <integer score 0-100 for layout, readability, consistency>,
              "content": <integer score 0-100 for clarity, conciseness, grammar, spelling>,
              "keywords": <integer score 0-100 for relevance of skills and terms to common job descriptions>,
              "impact": <integer score 0-100 for showcasing achievements and quantifiable results>
            },
            "suggestions": [<array of specific, actionable suggestion strings>],
            "strengths": [<array of specific strength strings>]
          }

          Resume Text:
          --- START RESUME ---
          ${resumeData.parsedText}
          --- END RESUME ---

          Ensure your entire response is ONLY the JSON object requested, without any introductory text, code block markers (\`\`\`), or explanations.

          JSON Response:
        `;

        // --- Call Gemini API --- (Consider adding safety settings)
        const generationConfig = {
            temperature: 0.2, // Lower temperature for more deterministic/factual response
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        };
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const result = await analyzeResumeAI(prompt);
        const aiTextResponse = result.response;

        logger.info(`[analyze]: Received raw response from ${result.model} for resume ${resumeId}.`);

        // --- Parse Gemini Response --- (Robust parsing needed)
        let analysisResult: ResumeAnalysisResult = {};
        try {
            // Attempt to parse the text response as JSON
            // Find the start and end of the JSON block if necessary
            const jsonMatch = aiTextResponse.match(/\{.*\}/s);
            if (jsonMatch && jsonMatch[0]) {
                analysisResult = JSON.parse(jsonMatch[0]);
                logger.info(`[analyze]: Successfully parsed JSON from Gemini response for resume ${resumeId}.`);
            } else {
                logger.error(`[analyze]: Failed to find valid JSON in Gemini response for resume ${resumeId}. Response: ${aiTextResponse}`);
                throw new Error('Failed to parse AI analysis response as JSON.');
            }

            // TODO: Add validation for the structure of analysisResult (ensure required keys exist)

        } catch (parseError: unknown) {
            if (parseError instanceof Error) {
                console.error(`[analyze]: Error parsing Gemini response for resume ${resumeId}:`, parseError.message);
                // Log the raw response for debugging
                console.error(`[analyze]: Raw AI response: ${aiTextResponse}`);
                res.status(500).json({ message: 'Failed to parse AI analysis response', error: parseError.message });
                return;
            }
        }

        // --- Compute roleMatchScore if frontend provided roleTitle/jobDescription ---
        const roleTitleInput = (req.body?.roleTitle || '').toString();
        const roleDescInput = (req.body?.jobDescription || '').toString();

        const computeRoleMatchScore = (roleTitle: string, roleDesc: string, resumeText: string): number => {
            const normalize = (s: string) => s
                .toLowerCase()
                .replace(/[^ -\p{L}\p{N} ]+/gu, ' ') // keep letters/numbers and spaces
                .replace(/\s+/g, ' ')
                .trim();

            // Expanded stopword list
            const stopwords = new Set([
                'the','and','a','an','to','for','of','in','on','with','is','are','or','by','as','at','from','that','this','it',
                'you','your','we','our','be','been','was','were','will','can','may','should','has','have','had','i','me','my','so','such'
            ]);

            const stem = (t: string) => t.replace(/(ing|ed|ly|es|s)$/i, '');

            const rtTitle = normalize(roleTitle || '');
            const rtDesc = normalize(roleDesc || '');
            const rz = normalize(resumeText || '');

            // Build token weights: title tokens get higher importance
            const collectTokens = (text: string) => Array.from(new Set(text.split(' ').filter(t => t && !stopwords.has(t) && t.length > 2)));
            const titleTokens = collectTokens(rtTitle);
            const descTokens = collectTokens(rtDesc);

            const tokenWeights = new Map<string, number>();
            for (const t of descTokens) tokenWeights.set(stem(t), Math.max(tokenWeights.get(stem(t)) || 0, 1));
            for (const t of titleTokens) tokenWeights.set(stem(t), Math.max(tokenWeights.get(stem(t)) || 0, 1.5));

            if (tokenWeights.size === 0) return 0;

            const resumeTokens = Array.from(new Set(rz.split(' ').filter(t => t && t.length > 2)));
            const resumeTokenSet = new Set(resumeTokens);
            const resumeStems = new Set(resumeTokens.map(stem));

            // Build resume phrase for substring checks (longer text)
            const resumeTextForPhrase = rz;

            let weightedMatch = 0;
            let maxWeight = 0;

            for (const [token, weight] of tokenWeights.entries()) {
                maxWeight += weight;
                let matchValue = 0;

                // exact token match
                if (resumeTokenSet.has(token)) {
                    matchValue = 1;
                } else if (resumeStems.has(token)) {
                    // stem match
                    matchValue = 0.9;
                } else {
                    // partial or substring matches
                    // check if any resume token contains token or token contains a resume token
                    const partial = resumeTokens.some(rt => rt.includes(token) || token.includes(rt));
                    if (partial) {
                        matchValue = 0.7;
                    } else if (resumeTextForPhrase.includes(token)) {
                        // phrase appearance in resume text
                        matchValue = 0.6;
                    } else {
                        // check for fuzzy by checking character overlap (>60%)
                        for (const rt of resumeTokens) {
                            const a = token;
                            const b = rt;
                            const minLen = Math.min(a.length, b.length);
                            if (minLen < 4) continue;
                            let common = 0;
                            const setB = new Set(b);
                            for (const ch of a) if (setB.has(ch)) common++;
                            const overlap = common / Math.max(a.length, b.length);
                            if (overlap >= 0.6) {
                                matchValue = 0.6;
                                break;
                            }
                        }
                    }
                }

                weightedMatch += matchValue * weight;
            }

            const rawScore = (weightedMatch / maxWeight) * 100;
            const score = Math.round(Math.max(0, Math.min(100, rawScore)));
            return score;
        };

        // Attach roleMatchScore when possible
        try {
            const roleTextCombined = `${roleTitleInput} ${roleDescInput}`.trim();
            if (roleTextCombined) {
                const roleMatchScore = computeRoleMatchScore(roleTitleInput, roleDescInput, resumeData.parsedText || '');
                (analysisResult as any).roleMatchScore = roleMatchScore;
                (analysisResult as any).roleTitle = roleTitleInput; // Always include roleTitle in response
                console.log(`[analyze]: Computed roleMatchScore=${roleMatchScore} for resume ${resumeId}`);
            }

            // --- AI-powered Matching/Missing Keywords Logic ---
            // 1. Use AI to get required keywords for the job role
            let aiKeywords: string[] = [];
            try {
                const aiKeywordPrompt = `Given the following job role and job description, list the most important skills, programming languages, libraries, frameworks, and project types required. Respond with a JSON array of keywords only, no explanations.\n\nJob Role: ${roleTitleInput}\nJob Description: ${roleDescInput}`;
                const aiKeywordText = await generateContentWithRetry(model, aiKeywordPrompt);
                const jsonMatch = aiKeywordText.match(/\[.*\]/s);
                if (jsonMatch && jsonMatch[0]) {
                    aiKeywords = JSON.parse(jsonMatch[0]);
                    if (!Array.isArray(aiKeywords)) aiKeywords = [];
                }
            } catch (err) {
                console.error('[analyze]: AI keyword extraction failed:', err);
            }

            // 2. Extract keywords from all resume data (skills, projects, parsedText)
            let resumeKeywords: string[] = [];
            if (Array.isArray((resumeData as any).skills)) {
                resumeKeywords = resumeKeywords.concat((resumeData as any).skills.map((s: string) => s.toLowerCase()));
            }
            if (Array.isArray((resumeData as any).projects)) {
                for (const proj of (resumeData as any).projects) {
                    if (Array.isArray(proj.technologies)) {
                        resumeKeywords = resumeKeywords.concat(proj.technologies.map((t: string) => t.toLowerCase()));
                    }
                    // Also include project name and description
                    if (proj.name) resumeKeywords.push(proj.name.toLowerCase());
                    if (proj.description) resumeKeywords = resumeKeywords.concat(proj.description.toLowerCase().split(/[^a-zA-Z0-9+#.]+/g));
                }
            }
            // Also extract from parsedText (for fuzzy match)
            const parsedText = (resumeData as any).parsedText || '';
            const resumeTextLower = parsedText.toLowerCase();
            resumeKeywords = resumeKeywords.concat(resumeTextLower.split(/[^a-zA-Z0-9+#.]+/g));
            // Remove duplicates and short tokens
            resumeKeywords = Array.from(new Set(resumeKeywords.filter(k => k.length > 2)));
            // Build helper sets for quick checks
            const resumeTokenSet = new Set(resumeKeywords);
            const stem = (t: string) => t.replace(/(ing|ed|ly|es|s)$/i, '');
            const resumeStemSet = new Set(resumeKeywords.map(stem));

            // Normalize AI keywords
            aiKeywords = Array.from(new Set(aiKeywords.map(k => (k || '').toString().toLowerCase().trim()).filter(k => k.length > 2)));

            // Small synonym map for common AI/ML terms (helps catch variants like sklearn/NLP)
            const synonymMap: Record<string, string[]> = {
                'scikit-learn': ['sklearn', 'scikit learn'],
                'natural language processing': ['nlp', 'natural-language processing', 'natural-language-processing'],
                'machine learning': ['machine-learning'],
                'deep learning': ['deep-learning'],
                'data preprocessing': ['data pre-processing', 'data pre processing'],
                'model training': ['training models'],
                'model evaluation': ['evaluate model', 'model validation']
            };
            const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const containsKeyword = (kw: string): boolean => {
                const k = (kw || '').toLowerCase().trim();
                if (!k) return false;
                if (resumeTokenSet.has(k)) return true; // exact token match

                // stem match for single words
                if (!k.includes(' ') && resumeStemSet.has(stem(k))) return true;

                // direct word/phrase boundary match in raw text
                try {
                    const re = new RegExp(`\\b${escapeRegex(k)}\\b`, 'i');
                    if (re.test(resumeTextLower)) return true;
                } catch { /* ignore bad regex */ }

                // variations: replace hyphens with spaces
                const noHyphen = k.replace(/-/g, ' ');
                if (noHyphen !== k) {
                    try {
                        const re2 = new RegExp(`\\b${escapeRegex(noHyphen)}\\b`, 'i');
                        if (re2.test(resumeTextLower)) return true;
                    } catch { /* ignore */ }
                }

                // synonyms
                const syns = synonymMap[k] || [];
                for (const s of syns) {
                    try {
                        const reS = new RegExp(`\\b${escapeRegex(s)}\\b`, 'i');
                        if (reS.test(resumeTextLower)) return true;
                    } catch { /* ignore */ }
                }
                return false;
            };

            // 3. Compute matching/missing using robust checks
            const matchingKeywords = aiKeywords.filter(containsKeyword);
            const missingKeywords = aiKeywords.filter(jk => !containsKeyword(jk));
            (analysisResult as any).matchingKeywords = matchingKeywords;
            (analysisResult as any).missingKeywords = missingKeywords;

            // --- Improved Role Match Score Calculation ---
            // If AI keywords are available, use their match ratio for the score
            if (aiKeywords.length > 0) {
                const matchRatio = matchingKeywords.length / aiKeywords.length;
                const aiRoleMatchScore = Math.round(matchRatio * 100);
                (analysisResult as any).roleMatchScore = aiRoleMatchScore;
                console.log(`[analyze]: AI-based roleMatchScore=${aiRoleMatchScore} (matched ${matchingKeywords.length} of ${aiKeywords.length} keywords)`);
            }
        } catch (e) {
            console.error('[analyze]: Error computing roleMatchScore or AI keywords:', e);
        }

        // --- Update Firestore --- 
    // No limit: return all suggestions/strengths as received from AI
        const nowISO = new Date().toISOString();
        const analysisUpdateData = {
            analysis: {
                ...analysisResult,
                roleTitle: roleTitleInput,
                analysisTimestamp: nowISO // Always send valid ISO string
            }
        };
        // Use resumeRef obtained earlier
        await resumeRef.update(analysisUpdateData);
        console.log(`[analyze]: Analysis results updated in Firestore for resume: ${resumeId}`);

        

        res.status(200).json({ message: 'Resume analyzed successfully', analysis: analysisUpdateData.analysis });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`[analyze]: Error during resume analysis for resume ${req.params.resumeId}:`, error.message);
            if ((error as ApiError).message.includes('GOOGLE_API_KEY_INVALID')) {
                res.status(500).json({ message: 'Internal Server Error: Invalid Gemini API Key configured.' });
            } else if ((error as ApiError).code === 'permission-denied' || (error as ApiError).status === 'PERMISSION_DENIED') {
                res.status(500).json({ message: 'Internal Server Error: Firebase permission issue.' });
            } else {
                res.status(500).json({ message: 'Internal server error during analysis', error: (error as ApiError).message });
            }
        }
    }
};

// --- Get Uploaded Resumes Function ---
export const getUploadedResumes = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;

        console.log(`[getResumes]: Fetching uploaded resumes for user ${userId}`);

        const resumesSnapshot = await db.collection('resumes')
            .where('userId', '==', userId)
            .orderBy('uploadTimestamp', 'desc') // Order by newest first
            .get();

        if (resumesSnapshot.empty) {
            console.log(`[getResumes]: No uploaded resumes found for user ${userId}`);
            res.status(200).json({ resumes: [] }); // Return empty array, not an error
            return;
        }

        const resumes = resumesSnapshot.docs.map(doc => {
            const data = doc.data() as Resume;
            // Return only necessary fields to the frontend
            return {
                id: doc.id,
                originalFilename: data.originalFilename,
                uploadTimestamp: data.uploadTimestamp,
                storagePath: data.storagePath || null,
                roleTitle: data.analysis?.roleTitle || null,
                roleMatchScore: data.analysis?.roleMatchScore ?? null,
                overallScore: data.analysis?.overallScore, // Include score if available
                analysisTimestamp: data.analysis?.analysisTimestamp
            };
        });

        // Debug: Log all resume IDs and filenames
        console.log(`[getResumes]: Found ${resumes.length} uploaded resumes for user ${userId}`);
        resumes.forEach(r => {
            console.log(`[getResumes]: Resume ID: ${r.id}, Filename: ${r.originalFilename}, Uploaded: ${r.uploadTimestamp}`);
        });
        res.status(200).json({ resumes });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`[getResumes]: Error fetching uploaded resumes for user ${req.user?.uid}:`, error.message);
            if ((error as ApiError).code === 'permission-denied' || (error as ApiError).status === 'PERMISSION_DENIED') {
                res.status(500).json({ message: 'Internal Server Error: Firebase permission issue.' });
            } else {
                res.status(500).json({ message: 'Internal server error fetching uploaded resumes', error: error.message });
            }
        }
    }
};

// --- Get Resume By ID (returns summary + analysis if present) ---
export const getResumeById = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user ? req.user.uid : 'anonymous';
        const { resumeId } = req.params;
        if (!resumeId) {
            res.status(400).json({ message: 'Bad Request: Missing resumeId parameter' });
            return;
        }

        const resumeRef = db.collection('resumes').doc(resumeId);
        const resumeDoc = await resumeRef.get();
        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }

        const data = resumeDoc.data() as Resume;
        if (data.userId !== userId && !(data.userId === 'anonymous' && userId === 'anonymous')) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume' });
            return;
        }

        // Return only necessary fields
        res.status(200).json({
            id: resumeDoc.id,
            originalFilename: data.originalFilename,
            uploadTimestamp: data.uploadTimestamp,
            analysis: data.analysis || null,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[getResumeById]: Error fetching resume:', error.message);
            res.status(500).json({ message: 'Internal server error fetching resume', error: error.message });
        }
    }
};

// --- Download Uploaded Resume (reconstruct as PDF from parsedText) ---
export const downloadUploadedResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        const { resumeId } = req.params;
        if (!resumeId) {
            res.status(400).json({ message: 'Bad Request: Missing resumeId parameter' });
            return;
        }

        const resumeRef = db.collection('resumes').doc(resumeId);
        const resumeDoc = await resumeRef.get();
        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }

        const resumeData = resumeDoc.data() as Resume;
        if (resumeData.userId !== userId && !(resumeData.userId === 'anonymous' && userId === 'anonymous')) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume' });
            return;
        }

        // Log request for debugging (will appear in server logs)
        const origName = resumeData.originalFilename || '';
        console.log(`[downloadUploadedResume] requested by user=${userId} resumeId=${resumeId} originalFilename=${origName}`);

        // If original file was stored in Firebase Storage, stream it directly
        if (resumeData.storagePath) {
            try {
                const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
                const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
                const fileHandle = bucket.file(resumeData.storagePath);
                const [exists] = await fileHandle.exists();
                if (exists) {
                    // Get metadata to set headers
                    const [metadata] = await fileHandle.getMetadata();
                    const contentType = metadata.contentType || 'application/octet-stream';
                    const size = metadata.size || undefined;
                    const safeName = origName ? origName.replace(/[^a-zA-Z0-9_.-]/g, '_') : `resume-${resumeId}`;
                    if (!/\.pdf$/i.test(safeName) && resumeData.originalFilename && /pdf$/i.test(resumeData.originalFilename)) {
                        // keep original extension if it was PDF
                    }
                    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
                    res.setHeader('Content-Type', contentType);
                    if (size) res.setHeader('Content-Length', size);
                    console.log(`[downloadUploadedResume] streaming stored file ${resumeData.storagePath} (${size || 'unknown'} bytes)`);
                    const readStream = fileHandle.createReadStream();
                    readStream.on('error', (err) => {
                        console.error('[downloadUploadedResume] Error streaming file from storage:', err);
                        res.status(500).json({ message: 'Error streaming file from storage', error: (err as Error).message });
                    });
                    readStream.pipe(res);
                    return;
                } else {
                    console.warn(`[downloadUploadedResume] storagePath set but file does not exist: ${resumeData.storagePath}`);
                }
            } catch (streamErr) {
                console.error('[downloadUploadedResume] Error accessing storage file:', streamErr instanceof Error ? streamErr.message : streamErr);
                // fall back to text reconstruction below
            }
        }

        const rawText = (resumeData.parsedText || '').toString();
        console.log(`[downloadUploadedResume] parsedText length=${rawText.length}`);

        // Sanitize text to avoid WinAnsi encoding errors from pdf-lib StandardFonts.
        // Remove C0/C1 control chars except tab/newline/carriage return, then
        // replace characters outside Latin-1 (0x00-0xFF) with '?'. This preserves
        // most Western characters while avoiding encoding exceptions.
        const withoutControls = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
        let replacedNonLatin1 = 0;
        const sanitized = withoutControls.replace(/[^\u0000-\u00FF]/g, (ch) => { replacedNonLatin1++; return '?'; });
        if (replacedNonLatin1 > 0) {
            console.log(`[downloadUploadedResume] replaced ${replacedNonLatin1} non-Latin1 chars with '?'.`);
        }

        // Create a simple PDF with sanitized text (fallback if original file not stored)
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 11;
        const margin = 50;
        const textWidth = width - 2 * margin;
        const lineHeight = fontSize * 1.2;
        let y = height - margin;

    const lines = sanitized.length > 0 ? sanitized.split('\n') : ['(No parsed text available to reconstruct the original file.)'];
        for (const line of lines) {
            let currentLine = '';
            const words = line.split(' ');
            for (const word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);
                if (testWidth < textWidth) {
                    currentLine = testLine;
                } else {
                    page.drawText(currentLine, { x: margin, y, font, size: fontSize, color: rgb(0, 0, 0) });
                    y -= lineHeight;
                    currentLine = word;
                    if (y < margin) break;
                }
            }
            page.drawText(currentLine, { x: margin, y, font, size: fontSize, color: rgb(0, 0, 0) });
            y -= lineHeight;
            if (y < margin) break;
        }

        const pdfBytes = await pdfDoc.save();

        // Sanitize and normalize filename
        let safeName = origName ? origName.replace(/[^a-zA-Z0-9_.-]/g, '_') : `resume-${resumeId}`;
        if (!/\.pdf$/i.test(safeName)) safeName = `${safeName}.pdf`;

        res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', String(pdfBytes.length));
        console.log(`[downloadUploadedResume] sending PDF (${pdfBytes.length} bytes) as ${safeName}`);
        res.status(200).send(Buffer.from(pdfBytes));

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[downloadUploaded]: Error generating PDF:', error.message);
            res.status(500).json({ message: 'Internal server error generating resume PDF', error: error.message });
        }
    }
};

// --- Delete Uploaded Resume ---
export const deleteUploadedResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userId = req.user.uid;
        const { resumeId } = req.params;
        if (!resumeId) {
            res.status(400).json({ message: 'Bad Request: Missing resumeId parameter' });
            return;
        }

        const resumeRef = db.collection('resumes').doc(resumeId);
        const resumeDoc = await resumeRef.get();
        if (!resumeDoc.exists) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }
        const resumeData = resumeDoc.data() as Resume;
        if (resumeData.userId !== userId && !(resumeData.userId === 'anonymous' && userId === 'anonymous')) {
            res.status(403).json({ message: 'Forbidden: You do not own this resume' });
            return;
        }

        await resumeRef.delete();
        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[deleteUploaded]: Error deleting resume:', error.message);
            res.status(500).json({ message: 'Internal server error deleting resume', error: error.message });
        }
    }
};

// TODO: Add other resume controller functions later (getResumeById, getAllResumes) 