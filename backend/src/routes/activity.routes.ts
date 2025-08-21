import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { db } from '../config/firebase.config';

const router = Router();

// GET /api/activity/recent - Get recent activity for the user (from Firestore)
router.get('/recent', authenticateToken, async (req: Request, res: Response) => {
    try {
        // @ts-ignore - authenticated token middleware attaches user
    const user = (req as any).user;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = user.uid;
    console.log(`[activity]: GET /recent requested by user: ${userId}`);

        // NOTE: composite index would be required for combining where(userId) with orderBy(timestamp).
        // To avoid requiring an index during development, fetch by userId only and sort in memory.
        const activitiesSnapshot = await db.collection('activities')
            .where('userId', '==', userId)
            .get();

        if (activitiesSnapshot.empty) {
            console.log(`[activity]: No activities found for user: ${userId}`);
            res.json([]);
            return;
        }

        // Sort documents in-memory by timestamp (desc) and take top 20
        const docs = activitiesSnapshot.docs.slice();
        docs.sort((a, b) => {
            const ad = a.data().timestamp;
            const bd = b.data().timestamp;
            const at = ad && typeof ad.toDate === 'function' ? ad.toDate().getTime() : 0;
            const bt = bd && typeof bd.toDate === 'function' ? bd.toDate().getTime() : 0;
            return bt - at;
        });

        const topDocs = docs.slice(0, 20);
        const activities = topDocs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                date: data.timestamp ? data.timestamp.toDate().toISOString() : null,
                type: data.type
            };
        });

        console.log(`[activity]: Returning ${activities.length} activities for user: ${userId} (sorted in-memory)`);
        res.json(activities);
    } catch (error) {
        console.error('[activity]: Error fetching activities', error);
        res.status(500).json({ message: 'Error fetching activities' });
    }
});

export default router;

// Dev-only debug endpoint: GET /api/activity/debug/my
// Returns raw activity documents for the authenticated user to aid debugging.
// Requires authentication; will return 403 in production to avoid accidental exposure.
router.get('/debug/my', authenticateToken, async (req: Request, res: Response) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            res.status(403).json({ message: 'Forbidden in production' });
            return;
        }
        // @ts-ignore
        const user = (req as any).user;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = user.uid;
        console.log(`[activity-debug]: GET /debug/my requested by user: ${userId}`);

        const snapshot = await db.collection('activities').where('userId', '==', userId).limit(200).get();
        const raw = snapshot.docs.map(d => ({ id: d.id, data: d.data() }));
        res.json({ count: raw.length, items: raw });
    } catch (err) {
        console.error('[activity-debug]: Error fetching debug activities', err);
        res.status(500).json({ message: 'Error fetching debug activities', error: String(err) });
    }
});
