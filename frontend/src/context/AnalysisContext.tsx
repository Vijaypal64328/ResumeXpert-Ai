import React, { createContext, useContext, useEffect, useState } from 'react';

type ResumeAnalysis = {
  overallScore?: number;
  categoryScores?: Record<string, number>;
  suggestions?: string[];
  strengths?: string[];
  analysisTimestamp?: any;
};

type AnalysisData = {
  roleTitle?: string;
  jobDescription?: string;
  resumeId?: string | null;
  analysis?: ResumeAnalysis | null;
};

type AnalysisContextType = {
  data: AnalysisData | null;
  setAnalysis: (d: AnalysisData) => void;
  clearAnalysis: () => void;
};

const STORAGE_KEY = 'acf_analysis_data_v1';

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AnalysisData | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, [data]);

  const setAnalysis = (d: AnalysisData) => setData(d);
  const clearAnalysis = () => setData(null);

  return (
    <AnalysisContext.Provider value={{ data, setAnalysis, clearAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider');
  return ctx;
};

export default AnalysisContext;
