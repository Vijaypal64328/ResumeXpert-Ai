import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { Footer } from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute"; // adjust path if different
import Home from "./pages/Home";
import AnalyzeResume from "./pages/AnalyzeResume";
import ResumeBuilder from "./pages/ResumeBuilder";
import FindJobs from "./pages/FindJobs";
import MyCoverLetters from "./pages/dashboard/MyCoverLetters";
import { AnalysisProvider } from "./context/AnalysisContext";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfilePage from "./pages/dashboard/ProfilePage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import CoverLetterGenerator from "./pages/dashboard/CoverLetterGenerator";
import MyResumes from "./pages/dashboard/MyResumes";
import HelpAndTips from "./pages/dashboard/HelpAndTips";
import PageRefresh from "./components/PageRefresh";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AnalysisProvider>
      <BrowserRouter>
        <PageRefresh />
        <Routes>
          {/* Main site routes */}
          <Route
            path="/"
            element={
              <>
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/analyze"
            element={
              <>
                <main className="flex-grow">
                  <AnalyzeResume />
                </main>
                <Footer />
              </>
            }
          />
          {/* Parameterized analyze route for viewing existing resume analysis */}
          <Route
            path="/analyze/:resumeId"
            element={
              <>
                <main className="flex-grow">
                  <AnalyzeResume />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/builder"
            element={
              <>
                <main className="flex-grow">
                  <ResumeBuilder />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/builder/edit/:id"
            element={
              <>
                <main className="flex-grow">
                  <ResumeBuilder />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/find-job"
            element={
              <>
                <main className="flex-grow">
                  <FindJobs />
                </main>
                <Footer />
              </>
            }
          />

          {/* Login route */}
          <Route
            path="/login"
            element={
              <>
                <main className="flex-grow">
                  <LoginPage />
                </main>
                <Footer />
              </>
            }
          />

          {/* Signup route */}
          <Route
            path="/signup"
            element={
              <>
                <main className="flex-grow">
                  <SignupPage />
                </main>
                <Footer />
              </>
            }
          />

          {/* Dashboard routes - Protected */}
              <Route path="my-cover-letters" element={<MyCoverLetters />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="analyze" element={<AnalyzeResume />} />
              <Route path="analyze/:resumeId" element={<AnalyzeResume />} />
              <Route path="builder" element={<ResumeBuilder />} />
              <Route path="find-job" element={<FindJobs />} />
              {/* legacy /dashboard/job-match removed; FindJobs covers job-finding flow */}
              <Route path="cover-letter" element={<CoverLetterGenerator />} />
              <Route path="my-resumes" element={<MyResumes />} />
              <Route path="help" element={<HelpAndTips />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Redirect /dashboard to /dashboard if missing trailing slash */}
          <Route path="/dashboard" element={<Navigate to="/dashboard" replace />} />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
  </BrowserRouter>
  </AnalysisProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
