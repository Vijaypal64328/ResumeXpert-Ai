import { Router } from 'express';
import {
	fixLocationGrammar,
	suggestJobTypeDescription,
	fixSummaryGrammar,
	fixExperienceGrammar,
	fixEducationGrammar,
	fixSkillsGrammar,
	fixProjectsGrammar,
	fixCertificationsGrammar,
	fixFieldGrammar
} from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/fix-location', authenticateToken, fixLocationGrammar);
router.post('/suggest-job-type', authenticateToken, suggestJobTypeDescription);
router.post('/fix-field', authenticateToken, fixFieldGrammar);
router.post('/fix-summary', authenticateToken, fixSummaryGrammar);
router.post('/fix-experience', authenticateToken, fixExperienceGrammar);
router.post('/fix-education', authenticateToken, fixEducationGrammar);
router.post('/fix-skills', authenticateToken, fixSkillsGrammar);
router.post('/fix-projects', authenticateToken, fixProjectsGrammar);
router.post('/fix-certifications', authenticateToken, fixCertificationsGrammar);

export default router;
