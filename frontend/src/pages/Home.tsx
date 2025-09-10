import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { SignInPromptModal } from "@/components/SignInPromptModal";
import { ArrowRight, FileText, Check, Zap, ArrowUpRight, ChevronRight, BarChart, Star, Briefcase, Cpu } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      const elements = document.querySelectorAll('.reveal');
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Hero Section - Redesigned */}
  <section className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          {/* Abstract shape - right */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-slate-50 to-white"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.03]"></div>
          
          {/* Accent circle */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-100 opacity-60 blur-3xl animate-pulse"></div>
          
          {/* Animated dots */}
          {/* Decorative floating dots for extra flair (class-based to satisfy linter) */}
          <div className="hidden lg:block">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className={`animated-dot dot-${i}`}></div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text content */}
            <div className={`lg:col-span-5 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
                <Zap size={14} className="mr-1.5" /> AI-Powered Resume Optimization
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4 sm:mb-6 leading-tight drop-shadow-lg">
                <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">ResumeXpert</span>
                <span className="block mt-2">Transform your job search</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-lg">
                Land more interviews with AI-powered resume analysis, keyword optimization, and job matching—all in one beautiful dashboard.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
              <Button 
                size="lg" 
                onClick={handleButtonClick}
                className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base py-5 px-5 sm:px-6"
              >
                  <span className="mr-2">Get Started</span>
                  <ArrowRight size={16} className="sm:size-[18px]" />
              </Button>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto text-slate-600 hover:text-blue-600"
                >
                  See how it works <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 mt-6">
                <div className="flex flex-col items-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">94%</div>
                  <div className="text-xs sm:text-sm text-slate-500">ATS Pass Rate</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">3x</div>
                  <div className="text-xs sm:text-sm text-slate-500">More Interviews</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-pink-600">10k+</div>
                  <div className="text-xs sm:text-sm text-slate-500">Users</div>
                </div>
              </div>
            </div>
            
            {/* Image/Visualization */}
            <div 
              ref={heroImgRef} 
              className={`lg:col-span-7 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              {/* Dashboard Preview */}
              <div className="relative">
                {/* Main container with shadow and rotation effect */}
                <div 
                  className="bg-white rounded-2xl shadow-xl p-1 transition-all duration-500 hover:shadow-2xl"
                  style={{
                    perspective: '1000px',
                    transform: `rotate3d(0.2, 0.2, 0, ${scrollY * 0.02}deg)`
                  }}
                >
                  {/* Dashboard Content */}
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center mr-3">
                          <FileText size={16} className="text-white" />
                        </div>
                        <span className="font-medium text-slate-800">Resume Analysis Dashboard</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full flex items-center">
                          <BarChart size={12} className="mr-1" /> Pro Version
                        </div>
                      </div>
                    </div>
                    
                    {/* Dashboard Body */}
                    <div className="grid grid-cols-12 gap-2 p-6">
                      {/* Left panel - Resume Content */}
                      <div className="col-span-6 bg-slate-50 rounded-lg p-4 h-60">
                        <div className="h-4 w-1/3 bg-slate-200 rounded mb-3"></div>
                        <div className="h-2 w-full bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-full bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-4/5 bg-slate-200 rounded mb-4"></div>
                        
                        <div className="h-4 w-1/4 bg-slate-200 rounded mb-3"></div>
                        <div className="h-2 w-full bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-full bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-3/4 bg-slate-200 rounded mb-4"></div>
                        
                        <div className="h-4 w-1/3 bg-slate-200 rounded mb-3"></div>
                        <div className="h-2 w-full bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-4/5 bg-slate-200 rounded"></div>
                      </div>
                      
                      {/* Right Panel - Analysis */}
                      <div className="col-span-6 flex flex-col gap-2">
                        {/* Score card */}
                        <div className="bg-slate-50 rounded-lg p-4 h-28 flex items-center">
                          <div className="w-20 h-20 rounded-full border-4 border-blue-100 flex items-center justify-center mr-4">
                            <div className="text-xl font-bold text-blue-600">87%</div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="font-medium mb-1 text-slate-800">ATS Compatibility</div>
                            <div className="flex items-center gap-1">
                              {[...Array(4)].map((_, i) => (
                                <Star key={i} size={12} fill="#3b82f6" color="#3b82f6" />
                              ))}
                              <Star size={12} fill="transparent" color="#3b82f6" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Keywords section */}
                        <div className="bg-slate-50 rounded-lg p-4 flex-1">
                          <div className="text-sm font-medium text-slate-600 mb-3">Suggested Keywords</div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">leadership</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">analytics</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">project management</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">strategy</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">innovation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="hidden lg:block absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 animate-float">
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <Check size={18} className="text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-800">Keywords Match</div>
                      <div className="text-sm font-bold text-green-600">92%</div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden lg:block absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 animate-float animation-delay-1000">
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <BarChart size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-800">Readability</div>
                      <div className="text-sm font-bold text-blue-600">Professional</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-900 mb-12 tracking-tight">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Powered Resume Builder (primary) */}
      <div className="reveal fade-bottom delay-200">
              <FeatureCard
                icon={<Cpu className="text-3xl text-blue-500" />}
                title="AI Powered Resume Builder"
                description="Create a tailored resume quickly using AI-driven templates and smart suggestions."
        className="hover:-translate-y-1 transition-transform duration-300"
              />
              <div className="mt-4 flex justify-center">
                <Button onClick={() => navigate('/dashboard/builder')} className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                  Try Builder
                </Button>
              </div>
            </div>

            {/* AI Resume Analysis */}
      <div className="reveal fade-bottom delay-300">
              <FeatureCard
                icon={<BarChart className="text-3xl text-purple-500" />}
                title="AI Resume Analysis"
                description="Get instant, actionable feedback on your resume for a specific job role, with scores and category suggestions."
        className="hover:-translate-y-1 transition-transform duration-300"
              />
              <div className="mt-4 flex justify-center">
                <Button onClick={() => navigate('/dashboard/analyze')} variant="outline" className="px-4 py-2 rounded-full">
                  Analyze Resume for Role
                </Button>
              </div>
            </div>

            {/* Find Jobs */}
      <div className="reveal fade-bottom delay-400">
              <FeatureCard
                icon={<Briefcase className="text-3xl text-pink-500" />}
                title="Find Jobs"
                description="Search and match to real job postings based on your resume and targeted roles."
        className="hover:-translate-y-1 transition-transform duration-300"
              />
              <div className="mt-4 flex justify-center">
                <Button onClick={() => navigate('/dashboard/find-job')} className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                  Find Jobs
                </Button>
              </div>
            </div>

            {/* Other features */}
            <FeatureCard
              className="reveal fade-bottom delay-500 hover:-translate-y-1 transition-transform duration-300"
              icon={<span className="text-3xl text-green-500">📊</span>}
              title="Resume Score"
              description="See how your resume scores and track improvements over time."
            />
            <FeatureCard
              className="reveal fade-bottom delay-600 hover:-translate-y-1 transition-transform duration-300"
              icon={<span className="text-3xl text-purple-500">�</span>}
              title="Keyword Optimization"
              description="Optimize your resume for ATS and recruiter searches with smart keyword suggestions."
            />
            <FeatureCard
              className="reveal fade-bottom delay-700 hover:-translate-y-1 transition-transform duration-300"
              icon={<span className="text-3xl text-yellow-500">🔒</span>}
              title="Secure & Private"
              description="Your data is encrypted and never shared. Privacy is our top priority."
            />
          </div>
        </div>
  </section>

      {/* Testimonial Section - Redesigned */}
      <section className="py-24 bg-white relative">
        {/* Background texture */}
        <div className="absolute inset-0 -z-10">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]"></div>
          
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <svg width="100%" height="100%">
              <filter id="testimonialNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#testimonialNoise)" />
            </svg>
          </div>

          {/* Gradient spots */}
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-blue-50 opacity-40 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-blue-50 opacity-40 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Testimonials Header */}
            <div className="mb-10 sm:mb-16 text-center reveal fade-bottom">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4 leading-tight">
                Trusted by thousands of job seekers
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                See how our AI resume optimization tool has helped professionals land their dream jobs
              </p>
            </div>
            
            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Testimonial 1 */}
              <div className="bg-white/70 backdrop-blur-sm border border-slate-100 rounded-xl p-6 reveal fade-bottom delay-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center space-x-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-slate-700 mb-6">
                  "I landed 3 interviews in my first week after optimizing my resume with ResumeXpert. The keyword suggestions were spot-on for the tech industry."
                </p>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden mr-3 border border-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-blue-600 p-2">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Sarah Johnson</p>
                    <p className="text-sm text-blue-600">Software Engineer at Google</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white/70 backdrop-blur-sm border border-slate-100 rounded-xl p-6 reveal fade-bottom delay-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center space-x-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-slate-700 mb-6">
                  "The AI analysis identified gaps in my resume that I hadn't noticed. After implementing the suggestions, I received callbacks from companies that had previously rejected me."
                </p>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden mr-3 border border-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-blue-600 p-2">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Michael Chen</p>
                    <p className="text-sm text-blue-600">Marketing Director</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white/70 backdrop-blur-sm border border-slate-100 rounded-xl p-6 reveal fade-bottom delay-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center space-x-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-slate-700 mb-6">
                  "As a recent graduate with limited experience, I was struggling to get noticed. AI Resume Pro helped me highlight my skills in a way that caught recruiters' attention."
                </p>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden mr-3 border border-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-blue-600 p-2">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Priya Patel</p>
                    <p className="text-sm text-blue-600">Business Analyst</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Featured Testimonial - Large removed as requested */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-blue-600 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center reveal fade-bottom">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Ready to land your dream job?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their careers with our AI-powered resume tools.
            </p>
            <Button 
              size="lg"
              onClick={handleButtonClick}
              className="bg-white text-blue-600 hover:bg-blue-50 rounded-full h-12 sm:h-14 px-6 sm:px-8 transition-all text-sm sm:text-base"
            >
              <span className="mr-2">Get Started Free</span>
              <ArrowRight size={16} className="sm:size-[18px]" />
          </Button>
          </div>
        </div>
      </section>
      
      <style>{`
        .reveal {
          position: relative;
          opacity: 0;
          transition: all 0.8s ease;
        }
        
        .reveal.active {
          opacity: 1;
        }
        
        .fade-bottom {
          transform: translateY(40px);
        }
        
        .fade-bottom.active {
          transform: translateY(0);
        }
        
        .delay-300 {
          transition-delay: 0.3s;
        }
  .delay-200 { transition-delay: 0.2s; }
        
        .delay-500 {
          transition-delay: 0.5s;
        }
        
        .delay-700 {
          transition-delay: 0.7s;
        }
  .delay-400 { transition-delay: 0.4s; }
  .delay-600 { transition-delay: 0.6s; }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Animated dots (replaces inline styles) */
        .animated-dot {
          position: absolute;
          border-radius: 9999px;
          background-color: rgb(96 165 250 / 1); /* sky-400 */
          opacity: 0.10;
          animation: bounce 2.2s infinite;
        }
        .dot-0 { width: 8px;  height: 8px;  top: 20%; right: 10%; animation-delay: 0s; }
        .dot-1 { width: 10px; height: 10px; top: 30%; right: 18%; animation-delay: 0.7s; }
        .dot-2 { width: 12px; height: 12px; top: 40%; right: 26%; animation-delay: 1.4s; }
        .dot-3 { width: 14px; height: 14px; top: 50%; right: 34%; animation-delay: 2.1s; }
        .dot-4 { width: 16px; height: 16px; top: 60%; right: 42%; animation-delay: 2.8s; }
        .dot-5 { width: 18px; height: 18px; top: 70%; right: 50%; animation-delay: 3.5s; }
      `}</style>
      <SignInPromptModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
    </div>
  );
};

export default Home;
