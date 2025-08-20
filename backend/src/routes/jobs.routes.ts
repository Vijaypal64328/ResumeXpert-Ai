import express, { Request, Response } from 'express';
import axios from 'axios';
import logger from '../utils/logger';

const router = express.Router();

// Normalized job type
interface Job {
  title: string;
  company: string;
  location: string;
  salary?: string;
  requirements?: string;
  description?: string;
  applyUrl: string;
  source: string;
}

// Result wrapper with totals
interface JobsResult {
  jobs: Job[];
  total: number; // total available on that source (if known)
}

// Helper: Fetch jobs from Adzuna (supports paging to reach a target count)
async function fetchAdzunaJobs(query: string, location: string, country: string = 'in', targetCount = 25, maxPages = 5): Promise<JobsResult> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return { jobs: [], total: 0 };

  const perPage = 25; // request size per page
  const results: Job[] = [];
  let totalCount = 0;

  try {
    for (let page = 1; page <= maxPages && results.length < targetCount; page++) {
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${appId}&app_key=${appKey}` +
        `&results_per_page=${perPage}` +
        (query ? `&what=${encodeURIComponent(query)}` : '') +
        (location ? `&where=${encodeURIComponent(location)}` : '');

      const res = await axios.get(url);
      // Adzuna exposes a count field for total matches
      if (typeof res.data.count === 'number') {
        totalCount = res.data.count;
      }

      const pageResults = (res.data.results || []).map((job: any) => ({
        title: job.title,
        company: job.company?.display_name || '',
        location: job.location?.display_name || '',
        salary: job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : undefined,
        requirements: job.category?.label,
        description: job.description,
        applyUrl: job.redirect_url,
        source: 'Adzuna',
      }));

      if (pageResults.length === 0) break; // no more results

      results.push(...pageResults);
    }

    // Trim to targetCount to avoid returning too many
    return { jobs: results.slice(0, targetCount), total: totalCount || results.length };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      logger.error('Adzuna API error:', err.response?.data || err.message);
    } else {
      logger.error('Adzuna API error:', (err as Error).message || err);
    }
    return { jobs: [], total: 0 };
  }
}

// Helper: Fetch jobs from Workable (public boards only)
// Workable doesn't necessarily expose a total count in the same way; return jobs and length
async function fetchWorkableJobs(query: string, targetCount = 25): Promise<JobsResult> {
  try {
    const url = `https://apply.workable.com/api/v3/accounts/workable/jobs?query=${encodeURIComponent(query)}`;
    const res = await axios.get(url);
    const jobs = (res.data.results || []).map((job: any) => ({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: undefined,
      requirements: job.department,
      description: job.description,
      applyUrl: job.url,
      source: 'Workable',
    }));
    return { jobs: jobs.slice(0, targetCount), total: jobs.length };
  } catch (err) {
  logger.error('Workable fetch error:', err instanceof Error ? err.message : err);
    return { jobs: [], total: 0 };
  }
}

// Add more APIs here as needed

// Main route: aggregate jobs with pagination
router.get('/search', async (req: Request, res: Response) => {
  const {
    query = '',
    location = '',
    country = 'in',
    page = '1',
    per_page = '10',
  } = req.query;

  // Parse pagination params
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const perPage = Math.min(50, Math.max(1, parseInt(per_page as string, 10) || 10));

  // Determine how many results we need from each source to fulfill the requested page
  const neededCount = pageNum * perPage; // fetch up to this many per source, then slice

  // Fetch from sources in parallel, asking each for neededCount (bounded inside helpers)
  const [adzunaRes, workableRes] = await Promise.all([
    fetchAdzunaJobs(query as string, location as string, country as string, neededCount, 6),
    fetchWorkableJobs(query as string, neededCount),
  ]);

  const combinedJobs = [...adzunaRes.jobs, ...workableRes.jobs];

  // Determine combined total. If Adzuna provided a total count we can use it; otherwise use lengths
  const combinedTotal = (adzunaRes.total || adzunaRes.jobs.length) + (workableRes.total || workableRes.jobs.length);

  // Slice out the requested page
  const start = (pageNum - 1) * perPage;
  const end = start + perPage;
  const pageJobs = combinedJobs.slice(start, end);

  // Determine if there are more items beyond this page. If combinedTotal is unknown (0), infer from lengths.
  const knownTotal = combinedTotal || combinedJobs.length;
  const hasMore = knownTotal > end;

  res.json({ jobs: pageJobs, page: pageNum, per_page: perPage, total: knownTotal, hasMore });
});

export default router;
