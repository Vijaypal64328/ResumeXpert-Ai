import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
// Firebase admin import might not be needed here anymore if init is handled elsewhere
// import admin from 'firebase-admin'; 

// Import routes

import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes'; // Import resume routes
import builderRoutes from './routes/builder.routes'; // Import builder routes
import matchRoutes from './routes/match.routes'; // Import match routes
import tipsRoutes from './routes/tips.routes'; // Import tips routes
import coverLetterRoutes from './routes/coverLetter.routes'; // Import the new routes
import usageRoutes from './routes/usage.routes'; // Import usage monitoring routes
// activityRoutes removed per simplification request
import dashboardRoutes from './routes/dashboard.routes'; // Import dashboard routes

import jobsRoutes from './routes/jobs.routes'; // Import jobs routes
import aiRoutes from './routes/ai.routes'; // Import AI helpers

dotenv.config(); // Load environment variables from .env file

// --- Firebase Admin SDK Initialization REMOVED (handled in config/firebase.config.ts) ---
// try { ... } catch { ... } block removed
// ------------------------------------------------------------------------------------

const app: Express = express();
const port = process.env.PORT || 3001; // Default to 3001 if PORT not in .env

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Allow requests from the frontend URL specified in .env
    credentials: true, // Optional: If you need to send cookies or authorization headers
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API Routes
app.use('/api/auth', authRoutes); // Use auth routes under /api/auth
app.use('/api/resumes', resumeRoutes); // Use resume routes under /api/resumes
app.use('/api/builder', builderRoutes); // Use builder routes under /api/builder
app.use('/api/match', matchRoutes); // Use match routes under /api/match
app.use('/api/tips', tipsRoutes); // Use tips routes under /api/tips
app.use('/api/cover-letter', coverLetterRoutes); // Use the new routes

app.use('/api/jobs', jobsRoutes); // Use jobs routes


app.use('/api/ai', aiRoutes); // Use AI-powered helpers
app.use('/api/usage', usageRoutes); // Use usage monitoring routes

// Health check endpoint for Render
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'ResumeXpert AI Backend',
        version: '1.0.0'
    });
});

// Keep-alive endpoint for Render free tier (prevents sleeping)
app.get('/api/keep-alive', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'alive', 
        timestamp: new Date().toISOString(),
        message: 'Server is active'
    });
});

// Self-ping to keep Render service active (only in production)
if (process.env.NODE_ENV === 'production') {
    const SELF_PING_INTERVAL = 14 * 60 * 1000; // 14 minutes (Render sleeps after 15 minutes)
    
    setInterval(async () => {
        try {
            const response = await axios.get(`${process.env.RENDER_EXTERNAL_URL || 'https://resumexpert-ai-backend.onrender.com'}/api/keep-alive`);
            console.log(`[Keep-Alive] Self-ping successful: ${response.status}`);
        } catch (error) {
            console.log(`[Keep-Alive] Self-ping failed:`, error);
        }
    }, SELF_PING_INTERVAL);
    
    console.log(`[Keep-Alive] Self-ping enabled - pinging every ${SELF_PING_INTERVAL / 60000} minutes`);
}

    // Activity routes removed to simplify project (Recent Activity feature removed)
app.use('/api/dashboard', dashboardRoutes); // Use dashboard routes

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send('ResumeXpert AI Backend is running!');
});

// Start the server only if running directly (not imported as a module)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}

export default app; // Export the app instance for testing 