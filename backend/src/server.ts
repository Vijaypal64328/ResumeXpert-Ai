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
// activityRoutes removed per simplification request
import dashboardRoutes from './routes/dashboard.routes'; // Import dashboard routes

import jobsRoutes from './routes/jobs.routes'; // Import jobs routes
import aiRoutes from './routes/ai.routes'; // Import AI helpers
import logger from './utils/logger';

dotenv.config(); // Load environment variables from .env file

// --- Firebase Admin SDK Initialization REMOVED (handled in config/firebase.config.ts) ---
// try { ... } catch { ... } block removed
// ------------------------------------------------------------------------------------

const app: Express = express();
const port = process.env.PORT || 3001; // Default to 3001 if PORT not in .env

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173', // Local development
        'http://localhost:3000', // Local development (alternative)
        /^https:\/\/.*\.onrender\.com$/, // Render frontend hosting
        process.env.FRONTEND_URL, // Production frontend URL from environment
    ].filter((origin): origin is string | RegExp => origin !== undefined), // Remove undefined values with proper type guard
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
    // Activity routes removed to simplify project (Recent Activity feature removed)
app.use('/api/dashboard', dashboardRoutes); // Use dashboard routes

// Basic routes
app.get('/', (req: Request, res: Response) => {
    res.send('ResumeXpert AI Backend is running!');
});

// Health check endpoint for Render
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Keep-alive functionality to prevent services from sleeping on free tier
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://resumexpert-frontend.onrender.com';
const BACKEND_URL = process.env.BACKEND_URL || 'https://resumexpert-backend.onrender.com';
const interval = 300000; // 5 minutes in milliseconds

function keepAlive() {
    // Only run keep-alive in production
    if (process.env.NODE_ENV === 'production') {
        // Ping frontend
        axios.get(FRONTEND_URL)
            .then(() => logger.info('Frontend pinged to stay awake'))
            .catch((err) => logger.error('Frontend ping failed:', err.message));

        // Ping backend health endpoint (self-ping)
        axios.get(`${BACKEND_URL}/health`)
            .then(() => logger.info('Backend pinged to stay awake'))
            .catch((err) => logger.error('Backend ping failed:', err.message));
    }
}

// Start the server only if running directly (not imported as a module)
if (require.main === module) {
    app.listen(port, () => {
        logger.info(`[server]: Server is running at http://localhost:${port}`);
        
        // Start keep-alive service in production
        if (process.env.NODE_ENV === 'production') {
            logger.info('Starting keep-alive service...');
            logger.info(`Pinging every ${interval / 1000 / 60} minutes:`);
            logger.info(`Frontend: ${FRONTEND_URL}`);
            logger.info(`Backend: ${BACKEND_URL}`);
            
            // Start interval pinging
            setInterval(keepAlive, interval);
            
            // Initial ping after 1 minute (give services time to start)
            setTimeout(keepAlive, 60000);
        }
    });
}

export default app; // Export the app instance for testing