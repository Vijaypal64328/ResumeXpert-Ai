import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CircleDashed, Zap, Briefcase, FileText, Upload, X, AlertTriangle, CheckCircle2, CheckCheck, Target, ArrowRight, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import apiClient, { fixLocationGrammarWithAI, suggestJobTypeDescriptionWithAI, fixFieldWithInstruction } from "@/lib/api";
import logger from '@/lib/logger';
import { useAnalysis } from "@/context/AnalysisContext";

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

interface MatchAnalysisResult {
  matchScore: number;
  missingKeywords: string[];
  matchingKeywords: string[];
  suggestions: string[];
}

const FindJobsPage = () => {
  // Resume upload & match states (merged from JobMatch)
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isResumeDragActive, setIsResumeDragActive] = useState(false);
  const { data, setAnalysis } = useAnalysis();
  const [roleTitle, setRoleTitle] = useState<string>(data?.roleTitle || '');
  const [roleDescription, setRoleDescription] = useState<string>(data?.jobDescription || '');
  const [autoAnalyzeOnUpload, setAutoAnalyzeOnUpload] = useState(false);
  const [isRoleSuggesting, setIsRoleSuggesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchAnalysisResult | null>(null);
  const [showResumeGuide, setShowResumeGuide] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (matchResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [matchResult]);

  const [jobLocation, setJobLocation] = useState("");
  const [jobTypeDescription, setJobTypeDescription] = useState("");
  const [isLocationFixing, setIsLocationFixing] = useState(false);
  const [isJobTypeSuggesting, setIsJobTypeSuggesting] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showJobs, setShowJobs] = useState(false);
  const [pageNum, setPageNum] = useState<number>(1);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const perPage = 10;

  const fetchJobs = async (query: string, page: number = 1) => {
    setIsLoadingJobs(true);
    let searchKeywords = query || roleDescription || roleTitle || jobTypeDescription;
    if (matchResult && matchResult.matchingKeywords.length > 0) {
      searchKeywords += ' ' + matchResult.matchingKeywords.slice(0, 8).join(' ');
    }
    try {
      const response = await apiClient.get('/jobs/search', {
        params: { query: searchKeywords, location: jobLocation, page, per_page: perPage }
      });
  setJobs(response.data.jobs || []);
  setPageNum(response.data.page || page);
  setTotalJobs(response.data.total || 0);
  setHasMore(typeof response.data.hasMore === 'boolean' ? response.data.hasMore : ((response.data.total || 0) > page * perPage));
    } catch (err) {
      setJobs([]);
      toast.error('Failed to fetch jobs.');
    } finally {
      setIsLoadingJobs(false);
      setShowJobs(true);
    }
  };

  // Resume upload handlers (from JobMatch)
  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeFile(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;
      if (
        fileType === "application/pdf" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setResumeFile(selectedFile);
        if (autoAnalyzeOnUpload) {
          if (!roleDescription.trim()) {
            (async () => {
              try {
                setIsRoleSuggesting(true);
                const base = `${roleTitle || ''} ${jobLocation || ''}`.trim();
                const suggestion = await suggestJobTypeDescriptionWithAI(base);
                setRoleDescription(suggestion);
                const firstLine = (suggestion.split(/\n|\.|\r/)[0] || '').trim();
                setRoleTitle(firstLine.slice(0, 60));
              } catch (err) {
                // ignore
              } finally {
                setIsRoleSuggesting(false);
              }
            })().then(() => handleMatch(selectedFile));
          } else {
            handleMatch(selectedFile);
          }
        }
      } else {
        toast.error("Please upload a PDF or DOCX file for the resume.");
        setResumeFile(null);
      }
    }
  };

  const clearResumeFile = () => {
    setResumeFile(null);
    const input = document.getElementById('resume-file-upload') as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleResumeDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResumeDragActive(true);
  };

  const handleResumeDragLeave = () => {
    setIsResumeDragActive(false);
  };

  const handleResumeDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResumeDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fileType = droppedFile.type;
      if (
        fileType === "application/pdf" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setResumeFile(droppedFile);
      } else {
        toast.error("Please upload a PDF or DOCX file for the resume.");
        setResumeFile(null);
      }
    }
  };

  const handleMatch = async (fileParam?: File | null) => {
    const fileToSend = fileParam || resumeFile;
    if (!fileToSend || !roleDescription.trim()) {
      toast.error("Please upload your resume and enter the role description");
      return;
    }
    setIsAnalyzing(true);
    setMatchResult(null);
    const formData = new FormData();
    formData.append('resumeFile', fileToSend);
    formData.append('jobDescription', roleDescription);
    formData.append('roleTitle', roleTitle);
    try {
      const response = await apiClient.post('/match/resume-job', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200 && response.data.analysis) {
        setMatchResult(response.data.analysis);
        // persist to AnalysisContext so other pages can reuse it
        try { setAnalysis({ roleTitle, jobDescription: roleDescription, resumeId: response.data.resumeId || null, analysis: response.data.analysis }); } catch (e) { /* ignore */ }
        toast.success(response.data.message || "Job match analysis complete!");
      } else {
        toast.error("Analysis completed but response format was unexpected.");
        logger.error("Unexpected match response:", response);
      }
    } catch (error: any) {
      logger.error("Match Error:", error);
      let errorMessage = "Error analyzing job match. Please try again.";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Network error. Could not reach the server.";
      }
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Find Job
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Search for jobs based on your role and preferences
            </p>
          </div>

          <Card className="mb-8 shadow-sm border-indigo-100">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                Find Job
              </CardTitle>
              <CardDescription>Search for jobs based on your matched role and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Last Analysis removed per user request */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <div className="flex gap-2">
                    <Input
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="e.g. Delhi, India"
                      disabled={isLoadingJobs || isLocationFixing}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100 shadow-sm"
                      disabled={!jobLocation || isLocationFixing}
                      onClick={async () => {
                        setIsLocationFixing(true);
                        try {
                          const fixed = await fixLocationGrammarWithAI(jobLocation);
                          setJobLocation(fixed);
                          toast.success("Location grammar fixed!");
                        } catch (err: any) {
                          toast.error("AI failed to fix location.");
                        } finally {
                          setIsLocationFixing(false);
                        }
                      }}
                    >
                      {isLocationFixing ? <CircleDashed className="animate-spin h-4 w-4 mr-1 text-sky-600" /> : <Zap className="h-4 w-4 mr-1 text-sky-600" />}
                      AI Fix
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <div className="flex items-center gap-2">
                    <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Job role (e.g. Software Engineer)" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100 shadow-sm"
                      disabled={!roleTitle || isRoleSuggesting}
                      onClick={async () => {
                        if (!roleTitle) return;
                        setIsRoleSuggesting(true);
                        try {
                          const fixed = await fixFieldWithInstruction('roleTitle', roleTitle, 'Return a short, clean job title (one line, no markdown, no parentheses).');
                          if (fixed && typeof fixed === 'string') setRoleTitle(fixed.trim().slice(0, 60));
                          toast.success('Role title refined');
                        } catch (err) {
                          console.error('AI fix failed for role title', err);
                          toast.error('AI fix failed for role title');
                        } finally {
                          setIsRoleSuggesting(false);
                        }
                      }}
                    >
                      {isRoleSuggesting ? <CircleDashed className="animate-spin h-4 w-4 mr-1 text-sky-600" /> : <Zap className="h-4 w-4 mr-1 text-sky-600" />}
                      AI Fix
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Extra Description (job type, filters, etc.)</label>
                <div className="relative">
                  <Textarea
                    value={jobTypeDescription}
                    onChange={(e) => setJobTypeDescription(e.target.value)}
                    placeholder="e.g. Remote, contract, full-time, startup, etc."
                    rows={3}
                    className="resize-none rounded-none border-0 focus-visible:ring-1 focus-visible:ring-indigo-500 pr-32"
                    disabled={isLoadingJobs || isJobTypeSuggesting}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 z-10 bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100 shadow-sm"
                    disabled={isJobTypeSuggesting}
                    onClick={async () => {
                      setIsJobTypeSuggesting(true);
                      try {
                        // Provide role and location as context for a concise filter-friendly description
                        const base = `${roleTitle || ''} ${jobLocation || ''}`.trim();
                        const suggestion = await suggestJobTypeDescriptionWithAI(base);
                        setJobTypeDescription(suggestion);
                        toast.success("AI suggestion added!");
                      } catch (err: any) {
                        toast.error("AI failed to suggest job type.");
                      } finally {
                        setIsJobTypeSuggesting(false);
                      }
                    }}
                  >
                    {isJobTypeSuggesting ? <CircleDashed className="animate-spin h-4 w-4 mr-1 text-sky-600" /> : <Zap className="h-4 w-4 mr-1 text-sky-600" />}
                    Suggest with AI
                  </Button>
                </div>
              </div>
                <div className="flex justify-center mt-6">
                <Button
                  onClick={() => fetchJobs(roleTitle || jobTypeDescription)}
                  disabled={isLoadingJobs}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg"
                >
                  {isLoadingJobs ? (
                    <>
                      <CircleDashed className="mr-2 h-5 w-5 animate-spin" />
                      Searching jobs...
                    </>
                  ) : (
                    <>Find Jobs</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showJobs && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">Matching Jobs</h2>
              {isLoadingJobs ? (
                <div className="text-center text-gray-500 py-8">Loading jobs...</div>
              ) : jobs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No jobs found for this query.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job, idx) => (
                    <Card key={idx} className="shadow border border-indigo-100 hover:shadow-lg transition-all">
                      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-indigo-500" />
                          {job.title}
                        </CardTitle>
                        <CardDescription className="flex flex-col gap-1 mt-2">
                          <span className="font-medium text-indigo-700">{job.company}</span>
                          <span className="text-gray-600">{job.location}</span>
                          {job.salary && <span className="text-green-600 font-semibold">{job.salary}</span>}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="mb-2 text-sm text-gray-700 line-clamp-4">{job.description}</div>
                        {job.requirements && (
                          <div className="mb-2 text-xs text-gray-500">Requirements: {job.requirements}</div>
                        )}
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs text-gray-400">Source: {job.source}</span>
                          <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">Apply</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {/* Pagination controls */}
              {jobs.length > 0 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Button
                    onClick={() => {
                      if (pageNum > 1) fetchJobs(roleTitle || jobTypeDescription, pageNum - 1);
                    }}
                    disabled={isLoadingJobs || pageNum <= 1}
                    variant="secondary"
                    size="sm"
                  >
                    &lt; Prev
                  </Button>

                  <div className="text-sm text-gray-600">Page {pageNum} — Showing {Math.min(perPage, jobs.length)}{totalJobs ? ` of ${totalJobs}` : ''}</div>

                  <Button
                    onClick={() => { if (hasMore) fetchJobs(roleTitle || jobTypeDescription, pageNum + 1); }}
                    disabled={isLoadingJobs || !hasMore}
                    variant="secondary"
                    size="sm"
                  >
                    Next &gt;
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Next Steps removed as requested */}
        </div>
      </div>
    </div>
  );
};

export default FindJobsPage;
