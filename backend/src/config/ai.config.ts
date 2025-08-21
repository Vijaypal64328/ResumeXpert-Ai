// AI service configuration and budget management
export interface AIConfig {
  // Budget settings
  dailyBudget: number;
  monthlyBudget: number;
  alertThresholds: {
    warning: number;  // Percentage of budget (e.g., 75)
    critical: number; // Percentage of budget (e.g., 90)
  };

  // Model preferences
  defaultModel: string;
  fallbackModels: string[];
  
  // Feature-specific model mapping
  modelPreferences: {
    [feature: string]: {
      model: string;
      complexity: 'simple' | 'medium' | 'complex';
    };
  };

  // Rate limiting
  retryConfig: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };
}

// Development/Free tier configuration
export const FREE_TIER_CONFIG: AIConfig = {
  dailyBudget: 0, // Free tier
  monthlyBudget: 0,
  alertThresholds: {
    warning: 80, // 80% of quota
    critical: 95 // 95% of quota
  },
  defaultModel: 'gemini-1.5-flash',
  fallbackModels: ['gemini-1.0-pro', 'gemini-1.5-flash'],
  modelPreferences: {
    'resume-analysis': { model: 'gemini-1.5-flash', complexity: 'medium' },
    'job-matching': { model: 'gemini-1.5-flash', complexity: 'medium' },
    'cover-letter': { model: 'gemini-1.5-flash', complexity: 'simple' },
    'resume-building': { model: 'gemini-1.5-flash', complexity: 'medium' },
    'tips-generation': { model: 'gemini-1.5-flash', complexity: 'simple' }
  },
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000
  }
};

// Basic paid tier configuration ($5-10/month)
export const BASIC_PAID_CONFIG: AIConfig = {
  dailyBudget: 0.50, // $15/month = ~$0.50/day
  monthlyBudget: 15.00,
  alertThresholds: {
    warning: 75,
    critical: 90
  },
  defaultModel: 'gemini-1.5-flash',
  fallbackModels: ['gemini-1.0-pro'],
  modelPreferences: {
    'resume-analysis': { model: 'gemini-1.5-pro', complexity: 'complex' },
    'job-matching': { model: 'gemini-1.5-flash', complexity: 'medium' },
    'cover-letter': { model: 'gemini-1.5-flash', complexity: 'medium' },
    'resume-building': { model: 'gemini-1.5-pro', complexity: 'complex' },
    'tips-generation': { model: 'gemini-1.5-flash', complexity: 'simple' }
  },
  retryConfig: {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 4000
  }
};

// Premium configuration ($25-50/month)
export const PREMIUM_CONFIG: AIConfig = {
  dailyBudget: 2.00, // $60/month = ~$2/day
  monthlyBudget: 60.00,
  alertThresholds: {
    warning: 70,
    critical: 85
  },
  defaultModel: 'gemini-1.5-pro',
  fallbackModels: ['gemini-1.5-flash', 'gemini-1.0-pro'],
  modelPreferences: {
    'resume-analysis': { model: 'gemini-1.5-pro', complexity: 'complex' },
    'job-matching': { model: 'gemini-1.5-pro', complexity: 'complex' },
    'cover-letter': { model: 'gemini-1.5-pro', complexity: 'complex' },
    'resume-building': { model: 'gemini-1.5-pro', complexity: 'complex' },
    'tips-generation': { model: 'gemini-1.5-flash', complexity: 'medium' }
  },
  retryConfig: {
    maxRetries: 5,
    baseDelay: 300,
    maxDelay: 2000
  }
};

// Get current configuration based on environment
export function getCurrentConfig(): AIConfig {
  const tier = process.env.AI_TIER || 'free';
  
  switch (tier.toLowerCase()) {
    case 'basic':
    case 'paid':
      return BASIC_PAID_CONFIG;
    case 'premium':
      return PREMIUM_CONFIG;
    case 'free':
    default:
      return FREE_TIER_CONFIG;
  }
}

// Environment variables you should set:
/*
Add to your .env file:

# AI Configuration
AI_TIER=free              # Options: free, basic, premium
GOOGLE_AI_API_KEY=your_api_key_here

# Optional: Custom budget overrides
DAILY_AI_BUDGET=0.50      # Override daily budget
MONTHLY_AI_BUDGET=15.00   # Override monthly budget

# Optional: Feature flags
ENABLE_MULTI_MODEL=true   # Enable automatic model fallback
ENABLE_COST_TRACKING=true # Enable cost tracking and alerts
*/
