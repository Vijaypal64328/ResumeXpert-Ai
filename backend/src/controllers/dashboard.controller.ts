import { Request, Response } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase.config';
import logger from '../utils/logger';

// Get dashboard stats for the current user
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Count resumes created (uploaded + generated)
    const uploadedResumesSnap = await db.collection('resumes').where('userId', '==', userId).get();
    const generatedResumesSnap = await db.collection('generatedResumes').where('userId', '==', userId).get();
    const resumesCreated = uploadedResumesSnap.size + generatedResumesSnap.size;

    // Count cover letters
    const coverLettersSnap = await db.collection('coverLetters').where('userId', '==', userId).get();
    const coverLetters = coverLettersSnap.size;

    // Get latest resume score and job match rate (from latest analyzed resume)
  let resumeScore = null;
  let jobMatchRate = null;
  let roleTitle = null;
    let resumeScoreTrend = null;
    let jobMatchRateTrend = null;
    let lastScore = null;
    let lastMatch = null;

    const allResumes = [...uploadedResumesSnap.docs, ...generatedResumesSnap.docs];
    allResumes.sort((a, b) => {
      const aTime = a.data().analysis?.analysisTimestamp?.toMillis?.() || 0;
      const bTime = b.data().analysis?.analysisTimestamp?.toMillis?.() || 0;
      return bTime - aTime;
    });
    if (allResumes.length > 0) {
      const latest = allResumes[0].data();
      resumeScore = latest.analysis?.overallScore ?? null;
      // Prefer roleMatchScore (stored as analysis.roleMatchScore), fallback to categoryScores.jobMatch
      jobMatchRate = latest.analysis?.roleMatchScore ?? latest.analysis?.categoryScores?.jobMatch ?? null;
      roleTitle = latest.analysis?.roleTitle ?? null;
      // Optionally, calculate trend vs previous resume
      if (allResumes.length > 1) {
        lastScore = allResumes[1].data().analysis?.overallScore ?? null;
        lastMatch = allResumes[1].data().analysis?.categoryScores?.jobMatch ?? null;
        if (resumeScore !== null && lastScore !== null) {
          resumeScoreTrend = ((resumeScore - lastScore) / lastScore * 100).toFixed(1) + '%';
        }
        if (jobMatchRate !== null && lastMatch !== null) {
          jobMatchRateTrend = ((jobMatchRate - lastMatch) / lastMatch * 100).toFixed(1) + '%';
        }
      }
    }

    res.json({
      resumeScore,
      resumeScoreTrend,
      jobMatchRate,
      jobMatchRateTrend,
      roleTitle,
      resumesCreated,
      coverLetters
    });
  } catch (error) {
    logger.error('[Dashboard][getDashboardStats] Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
};
