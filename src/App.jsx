import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicNavbar from './components/PublicNavbar';
import Navbar from './components/Navbar';

// Pages
import LandingPage from "./pages/LandingPage";
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CreateResume from './pages/CreateResume';
import ResumeBuilder from './pages/ResumeBuilder';
import AnalyzeResume from './pages/AnalyzeResume';
import FindJobs from './pages/FindJobs';
import Help from './pages/Help';
import Contact from './pages/Contact';
// import UpdateProfile from './pages/UpdateProfile';

function App() {
  const location = useLocation();
  const publicPaths = ['/', '/auth'];

  return (
    <>
      {/* Auto-switch Navbar based on public/private route */}
      {publicPaths.includes(location.pathname) ? <PublicNavbar /> : <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-resume" element={<ProtectedRoute><CreateResume /></ProtectedRoute>} />
        <Route path="/create-resume/builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/create-resume/builder/:resumeId" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/analyze-resume" element={<ProtectedRoute><AnalyzeResume /></ProtectedRoute>} />
        <Route path="/find-jobs" element={<ProtectedRoute><FindJobs /></ProtectedRoute>} />
        {/* <Route path="/update-profile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} /> */}
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
