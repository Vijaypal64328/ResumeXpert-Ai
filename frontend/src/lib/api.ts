// AI-powered location grammar fix
export async function fixLocationGrammarWithAI(location: string) {
  const response = await apiClient.post('/ai/fix-location', { location });
  return response.data.fixedLocation;
}

// AI-powered job type/extra description suggestion
export async function suggestJobTypeDescriptionWithAI(base: string) {
  const response = await apiClient.post('/ai/suggest-job-type', { base });
  return response.data.suggestion;
}

// AI-powered summary grammar fix
export async function fixSummaryGrammarWithAI(summary: string) {
  const response = await apiClient.post('/ai/fix-summary', { summary });
  return response.data.fixedSummary;
}

// AI-powered experience grammar fix
export async function fixExperienceGrammarWithAI(experience: any) {
  const response = await apiClient.post('/ai/fix-experience', experience);
  return response.data.fixed;
}

// AI-powered education grammar fix
export async function fixEducationGrammarWithAI(education: any) {
  const response = await apiClient.post('/ai/fix-education', education);
  return response.data.fixed;
}

// AI-powered skills grammar fix
export async function fixSkillsGrammarWithAI(skills: any) {
  const response = await apiClient.post('/ai/fix-skills', { skills });
  return response.data.fixedSkills;
}

// AI-powered projects grammar fix
export async function fixProjectsGrammarWithAI(project: any) {
  const response = await apiClient.post('/ai/fix-projects', project);
  return response.data.fixed;
}

// AI-powered certifications grammar fix
export async function fixCertificationsGrammarWithAI(cert: any) {
  const response = await apiClient.post('/ai/fix-certifications', cert);
  return response.data.fixed;
}

// AI-powered generic field grammar fix
export async function fixFieldGrammarWithAI(field: string, value: string) {
  const response = await apiClient.post('/ai/fix-field', { field, value });
  return response.data.fixed;
}

// AI field fix with an extra instruction prepended to the value. Some AI prompts need
// additional guidance (for example: shorten title, strip markdown). This helper
// prepends the instruction to the value before calling the same backend endpoint.
export async function fixFieldWithInstruction(field: string, value: string, instruction?: string) {
  const payloadValue = instruction && instruction.trim() ? `${instruction.trim()}\n\n${value}` : value;
  const response = await apiClient.post('/ai/fix-field', { field, value: payloadValue });
  // backend returns { fixed: ... }
  return response.data.fixed;
}

// Dashboard stats API
export async function getDashboardStats() {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
}

import axios from 'axios';
import logger from './logger';

// Retrieve the API base URL from environment variables
// Vite exposes env variables prefixed with VITE_ on import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  logger.error("Error: VITE_API_BASE_URL environment variable is not set.");
  // You might want to throw an error here or provide a default
  // depending on how critical this is for your app to function.
}

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Firebase ID Token
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from local storage (stored by AuthContext)
    const token = localStorage.getItem('firebaseIdToken');
    if (token) {
      // Attach the token as a Bearer token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      logger.info('[API Interceptor] Token attached to request');
    } else {
      logger.info('[API Interceptor] No token found in localStorage.');
    }
    return config;
  },
  (error) => {
    // Log errors during request setup
  logger.error('[API Interceptor] Error attaching token:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response, // Return successful responses directly
  (error) => {
    // Handle common errors globally
  if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
    logger.error("[API Interceptor] 401 Unauthorized response");
        
        // Don't redirect from login page
        const isOnAuthPage = window.location.pathname.includes('/login') || 
                             window.location.pathname.includes('/signup');
        
        // Check if user was previously logged in
        const hadToken = localStorage.getItem('firebaseIdToken');
        
        if (hadToken && !isOnAuthPage) {
          logger.info("[API Interceptor] Token invalid or expired. Clearing localStorage.");
          localStorage.removeItem('firebaseIdToken');
          
          // Avoid redirecting if already on an auth page
          if (!isOnAuthPage) {
            logger.info("[API Interceptor] Redirecting to login...");
            // Store the current location to redirect back after login
            localStorage.setItem('authRedirectPath', window.location.pathname);
            window.location.href = '/login';
          }
        }
      } else if (status === 403) {
        logger.error("[API Interceptor] 403 Forbidden - User doesn't have sufficient permissions");
      } else if (status >= 500) {
        logger.error("[API Interceptor] Server error:", status, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response was received
      logger.error("[API Interceptor] Network error - no response received:", error.request);
    } else {
      // Something else happened while setting up the request
      logger.error("[API Interceptor] Error:", error.message);
    }
    
    // Always reject the promise for specific error handling in components
    return Promise.reject(error);
  }
);


// Suggest job description using AI (resume file)
// NOTE: suggestJobDescriptionWithAI was removed — suggestion flow moved to FindJobs + suggestJobTypeDescriptionWithAI

export default apiClient;