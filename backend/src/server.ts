import express, { Express, Request, Response } from 'express';
import http from 'http';
import https from 'https';
import dotenv from 'dotenv';
import cors from 'cors';
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
    // Activity routes removed to simplify project (Recent Activity feature removed)
app.use('/api/dashboard', dashboardRoutes); // Use dashboard routes

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send('AI Resume Pro Backend is running!');
});

// Lightweight health endpoint for uptime checks
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// Start the server only if running directly (not imported as a module)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);

    // Keep-alive self ping:
    // Enabled by default (no env needed) with a sensible health URL and interval.
    // You can still override via env: KEEP_ALIVE, KEEP_ALIVE_URL, KEEP_ALIVE_INTERVAL_MS
    const keepAliveEnabled = String(process.env.KEEP_ALIVE ?? 'true').toLowerCase() === 'true';
    const keepAliveUrl = process.env.KEEP_ALIVE_URL ?? 'https://resumexpert-ai-backend.onrender.com/api/health';
    const intervalMs = Number(process.env.KEEP_ALIVE_INTERVAL_MS ?? 10 * 60 * 1000); // default 10m

        const safePing = (url: string) => {
            try {
                const client = url.startsWith('https') ? https : http;
                const req = client.get(url, (res) => {
                    // drain and ignore body
                    res.resume();
                });
                req.on('error', (err) => {
                    console.warn('[keep-alive] ping failed:', (err as any)?.message || err);
                });
            } catch (err) {
                console.warn('[keep-alive] ping error:', (err as any)?.message || err);
            }
        };

        if (keepAliveEnabled && keepAliveUrl) {
            const humanInterval = intervalMs >= 60_000
                ? `${Math.round(intervalMs/60_000)}m`
                : `${Math.round(intervalMs/1000)}s`;
            console.log(`[keep-alive]: enabled — pinging ${keepAliveUrl} every ${humanInterval}`);
            // immediate first ping, then interval
            safePing(keepAliveUrl);
            setInterval(() => safePing(keepAliveUrl), intervalMs);
        } else {
            console.log('[keep-alive]: disabled (set KEEP_ALIVE=true and KEEP_ALIVE_URL to enable)');
        }
    });
}

export default app; // Export the app instance for testing 