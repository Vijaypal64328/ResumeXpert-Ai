import { Link } from "react-router-dom";
import logger from '@/lib/logger';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Upload, 
  FileText, 
  BarChart, 
  FileEdit, 
  ArrowUpRight, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  LineChart,
  Loader2,
  PlusCircle, // Added for the new button
  Cpu
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import apiClient, { getDashboardStats } from "@/lib/api"; // Corrected: Import default export

// Define interfaces for our data structures
interface StatData {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  description: string;
  icon: JSX.Element;
  color: string;
}


interface TaskData {
  title: string;
  description: string;
  dueDate: string;
}

interface ResumeStrengthData {
  keywords: number;
  experience: number;
  skills: number;
  readability: number;
}


export default function DashboardHome() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatData[]>([]);
  // Recent activity removed to simplify UI
  const [upcomingTasksData, setUpcomingTasksData] = useState<TaskData[]>([]);


  // Current date greeting
  const currentDate = new Date();
  const hours = currentDate.getHours();
  let greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";
  if (user && user.displayName) {
    greeting += `, ${user.displayName}`;
  }
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);


  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Fetch dashboard stats from backend
      try {
        const stats = await getDashboardStats();
        setStatsData([
          {
            title: 'Resume Score',
            value: stats.resumeScore !== null && stats.resumeScore !== undefined ? stats.resumeScore.toString() : '--',
            trend: stats.resumeScoreTrend || '',
            trendUp: stats.resumeScoreTrend ? parseFloat(stats.resumeScoreTrend) >= 0 : undefined,
            description: 'Overall resume quality',
            icon: <LineChart className="h-5 w-5 text-blue-500" />, 
            color: 'from-blue-500 to-indigo-600'
          },
          {
            title: stats.roleTitle ? `Job Role Match — ${stats.roleTitle.length > 30 ? stats.roleTitle.slice(0, 27) + '…' : stats.roleTitle}` : 'Job Role Match Rate',
            value: stats.jobMatchRate !== null && stats.jobMatchRate !== undefined ? stats.jobMatchRate.toString() : '--',
            trend: stats.jobMatchRateTrend || '',
            trendUp: stats.jobMatchRateTrend ? parseFloat(stats.jobMatchRateTrend) >= 0 : undefined,
            description: stats.roleTitle ? `Match to role: ${stats.roleTitle}` : 'Match to job postings',
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, 
            color: 'from-emerald-500 to-teal-600'
          },
          {
            title: 'Resumes Created',
            value: stats.resumesCreated !== null && stats.resumesCreated !== undefined ? stats.resumesCreated.toString() : '--',
            description: 'Total active resumes',
            icon: <FileText className="h-5 w-5 text-violet-500" />, 
            color: 'from-violet-500 to-purple-600'
          },
          {
            title: 'Cover Letters',
            value: stats.coverLetters !== null && stats.coverLetters !== undefined ? stats.coverLetters.toString() : '--',
            description: 'Generated cover letters',
            icon: <FileEdit className="h-5 w-5 text-amber-500" />, 
            color: 'from-amber-500 to-orange-600'
          },
        ]);
      } catch (error) {
  logger.error('Failed to fetch dashboard stats:', error);
        // Only set mock data if API call fails
        setStatsData([
          { 
            title: "Resume Score", 
            value: "78", 
            trend: "+5%",
            trendUp: true,
            description: "Overall resume quality",
            icon: <LineChart className="h-5 w-5 text-blue-500" />, 
            color: "from-blue-500 to-indigo-600"
          },
          { 
            title: "Job Role Match Rate", 
            value: "62", 
            trend: "-2%",
            trendUp: false,
            description: "Match to job postings",
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, 
            color: "from-emerald-500 to-teal-600" 
          },
          { 
            title: "Resumes Created", 
            value: "3", 
            description: "Total active resumes",
            icon: <FileText className="h-5 w-5 text-violet-500" />, 
            color: "from-violet-500 to-purple-600" 
          },
          { 
            title: "Cover Letters", 
            value: "1", 
            description: "Generated cover letters",
            icon: <FileEdit className="h-5 w-5 text-amber-500" />, 
            color: "from-amber-500 to-orange-600" 
          },
        ]);
      }
  setUpcomingTasksData([
        {
          title: "Follow up with Acme Corp",
          description: "Send a thank you email after interview.",
          dueDate: "Tomorrow"
        },
        {
          title: "Update LinkedIn Profile",
          description: "Add new skills and projects.",
          dueDate: "End of week"
        }
      ]);
      // recent activities removed; finish loading
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Quick actions (considered static configuration, not mock data to be removed)
  const quickActions = [
    {
      title: "Build New Resume",
      description: "Create a customized resume with AI assistance",
      icon: <FileText className="h-5 w-5" />,
      link: "/dashboard/builder",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
  title: "Analyze Resume for Job Role",
  description: "Get instant feedback on your current resume for a specific job role",
      icon: <Upload className="h-5 w-5" />,
      link: "/dashboard/analyze",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      title: "Find Jobs",
      description: "Compare your resume to a specific job posting",
      icon: <BarChart className="h-5 w-5" />,
      link: "/dashboard/find-job",
      color: "bg-violet-50 text-violet-700 border-violet-200"
    },
    {
      title: "Generate Cover Letter",
      description: "Create a tailored cover letter for your application",
      icon: <FileEdit className="h-5 w-5" />,
      link: "/dashboard/cover-letter",
      color: "bg-amber-50 text-amber-700 border-amber-200"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{greeting}</h2>
          <p className="text-gray-500 mt-1">{formattedDate}</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-md">
              <div className={`h-1 w-full bg-gray-200 animate-pulse`}></div>
              <CardContent className="pt-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          statsData.map((stat, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-md">
              <div className={`h-1 w-full bg-gradient-to-r ${stat.color}`}></div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <div className="flex items-baseline mt-1">
                      <h3 className="text-3xl font-bold text-gray-900">{stat.value}{stat.title.includes("Score") || stat.title.includes("Rate") ? "%" : ""}</h3>
                      {stat.trend && (
                        <span className={`ml-2 text-sm font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Main content area - two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Left column - Quick actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions (Remains as static UI configuration) */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
              <CardDescription>Start your resume optimization process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {quickActions.map((action, index) => (
                        <Link 
                          key={index} 
                          to={action.link}
                          className={`group flex flex-col items-center justify-center p-8 rounded-2xl border-2 ${action.color} transition-all hover:shadow-xl fade-in-card`}
                          style={{ minHeight: '160px' }}
                        >
                          <div className="mb-4 p-4 rounded-full bg-white shadow-lg text-2xl">{action.icon}</div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-1 text-center">{action.title}</h3>
                          <p className="text-sm text-gray-500 text-center">{action.description}</p>
                          {/* AI badge for AI-powered actions */}
                          {['Build New Resume','Analyze Resume for Job Role','Generate Cover Letter'].includes(action.title) && (
                            <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-full bg-black/5 text-xs text-gray-700">
                              <Cpu className="h-4 w-4 text-gray-600" />
                              <span>AI Powered</span>
                            </div>
                          )}
                          <ArrowUpRight className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" size={22} />
                        </Link>
                      ))}
      <style>{`
        .fade-in-card { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.7s forwards; }
        @keyframes fadeInUp {
          to { opacity: 1; transform: none; }
        }
      `}</style>
              </div>
            </CardContent>
          </Card>
          
        </div>
        
  {/* Right column - Upcoming tasks only (Resume Strength removed) */}
  <div className="space-y-6">
          
          {/* Upcoming Tasks */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-gray-900">Upcoming Tasks</CardTitle>
              <CardDescription>Items on your to-do list</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4 py-4">
                  {Array(2).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingTasksData.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTasksData.map((task, index) => (
                    <div key={index} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="p-2 rounded-full bg-amber-50 text-amber-600 mr-3">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <p className="text-xs text-amber-600 mt-1 flex items-center">
                          <Clock size={12} className="mr-1" /> Due: {task.dueDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Upcoming Tasks</h3>
                  <p className="mt-1 text-sm text-gray-500">Your to-do list is clear.</p>
                </div>
              )}
            </CardContent>
            {upcomingTasksData.length > 0 && !isLoading && (
              <CardFooter className="border-t bg-gray-50">
                <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View All Tasks
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* Tip of the day (static, so it remains) */}
          <Card className="border border-blue-100 shadow-sm bg-blue-50">
            <CardContent className="p-5">
              <div className="flex">
                <div className="p-2 rounded-full bg-blue-100 text-blue-700 mr-3 flex-shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Resume Tip</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Including quantifiable achievements can increase your resume's effectiveness by up to 40%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
}
