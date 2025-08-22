// Utility for handling AI requests with rate limiting and retry logic
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import logger from './logger';
import { CostTracker } from './costTracker';
import { getCurrentConfig } from '../config/ai.config';

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
};

/**
 * Sleep for a given number of milliseconds
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if an error is a rate limiting error (429) vs quota exhaustion
 */
const isRateLimitError = (error: any): boolean => {
  return error && (
    error.status === 429 || 
    error.statusText === 'Too Many Requests' ||
    (error.message && error.message.includes('429'))
  );
};

/**
 * Check if an error is a quota exhaustion (daily/monthly limit reached)
 */
const isQuotaExhaustedError = (error: any): boolean => {
  if (!error) return false;
  
  const message = error.message || '';
  const errorDetails = error.errorDetails || [];
  
  // Check for quota exhaustion indicators
  const hasQuotaFailure = errorDetails.some((detail: any) => 
    detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
  );
  
  const hasQuotaMessage = message.includes('exceeded your current quota') ||
                         message.includes('quota exceeded') ||
                         message.includes('FreeTier');
  
  return hasQuotaFailure || hasQuotaMessage;
};

// Multi-model configuration for automatic fallback
const FALLBACK_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

/**
 * Get AI instance with automatic model fallback
 */
const getAIWithFallback = (): { genAI: GoogleGenerativeAI; availableModels: string[] } => {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY or GEMINI_API_KEY is not configured');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return { genAI, availableModels: FALLBACK_MODELS };
};

/**
 * Try multiple models until one succeeds or all fail
 */
const tryMultipleModels = async (
  prompt: string,
  options: RetryOptions = {},
  feature?: string
): Promise<{ response: string; cost: number; model: string }> => {
  const { genAI, availableModels } = getAIWithFallback();
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  
  let lastError: Error = new Error('No models attempted');
  
  for (const modelName of availableModels) {
    try {
      logger.info(`[MultiModel] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Try this model with retry logic
      const result = await makeAIRequestWithRetry(model, prompt, config, feature);
      logger.info(`[MultiModel] Success with model: ${modelName}`);
      return result;
      
    } catch (error: any) {
      lastError = error;
      
      if (isQuotaExhaustedError(error)) {
        logger.info(`[MultiModel] ${modelName} quota exhausted, trying next model`);
        continue; // Try next model
      } else {
        // Non-quota error, don't try other models
        logger.error(`[MultiModel] ${modelName} failed with non-quota error:`, error);
        throw error;
      }
    }
  }
  
  // All models failed
  logger.error(`[MultiModel] All models exhausted their quotas`);
  throw new Error(
    'All available AI models have exceeded their daily quotas. ' +
    'Please try again tomorrow or consider upgrading to a paid plan for higher limits.'
  );
};

/**
 * Export helper functions for use in controllers
 */
export { isQuotaExhaustedError, isRateLimitError, tryMultipleModels };

/**
 * Make AI request with retry logic and cost tracking
 */
export const makeAIRequestWithRetry = async (
  model: GenerativeModel,
  prompt: string,
  options: RetryOptions = {},
  feature?: string
): Promise<{ response: string; cost: number; model: string }> => {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const aiConfig = getCurrentConfig();
  
  // Get model name for cost tracking
  const modelName = (model as any)._modelName || 'gemini-1.5-flash';
  
  logger.info(`[AI] Starting request with model: ${modelName}, feature: ${feature || 'unknown'}`);
  
  let lastError: Error = new Error('No attempts made');

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      logger.info(`[AI] Attempt ${attempt + 1}/${config.maxRetries + 1}`);
      
      // Calculate estimated cost before request
      const estimatedCost = CostTracker.calculateTextCost(modelName, prompt, '');
      logger.info(`[AI] Estimated cost: ${CostTracker.formatCost(estimatedCost)}`);
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Calculate actual cost after response
      const actualCost = CostTracker.calculateTextCost(modelName, prompt, text);
      
      logger.info(`[AI] Request successful on attempt ${attempt + 1}`);
      logger.info(`[AI] Actual cost: ${CostTracker.formatCost(actualCost)}`);
      
      return {
        response: text,
        cost: actualCost,
        model: modelName
      };
      
    } catch (error: any) {
      lastError = error;
      logger.error(`[AI] Attempt ${attempt + 1} failed:`, error);

      // Check for quota exhaustion vs rate limiting
      if (isQuotaExhaustedError(error)) {
        logger.error(`[AI] Quota exhausted for model ${modelName}. This cannot be retried.`);
        throw new Error(
          `Daily quota exceeded for ${modelName}. ` +
          `Consider upgrading your plan or using multiple models. ` +
          `Current usage may have exceeded the free tier limit of 50 requests per day.`
        );
      }

      // If this is not a rate limit error, don't retry
      if (!isRateLimitError(error)) {
        logger.error(`[AI] Non-rate-limit error encountered, not retrying:`, error);
        throw error;
      }

      // If we've exhausted our retries, throw the last error
      if (attempt === config.maxRetries) {
        logger.error(`[AI] Exhausted all ${config.maxRetries + 1} attempts due to rate limiting`);
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelayMs
      );

      logger.info(`[AI] Rate limited, waiting ${delay}ms before retry ${attempt + 2}/${config.maxRetries + 1}`);
      await sleep(delay);
    }
  }

  // This should never be reached, but just in case
  throw lastError;
};

/**
 * Generate content with retry logic for rate limiting
 */
export const generateContentWithRetry = async (
  model: GenerativeModel,
  prompt: string,
  options: RetryOptions = {}
): Promise<string> => {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      logger.info(`[AI] Generating content (attempt ${attempt + 1}/${config.maxRetries + 1})`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      logger.info(`[AI] Content generated successfully on attempt ${attempt + 1}`);
      return text;
      
    } catch (error: any) {
      lastError = error;
      
      // Log the error
      logger.error(`[AI] Generation failed on attempt ${attempt + 1}:`, {
        status: error.status,
        statusText: error.statusText,
        message: error.message
      });

      // If this is quota exhaustion, don't retry - it won't help
      if (isQuotaExhaustedError(error)) {
        logger.error(`[AI] Quota exhausted, not retrying:`, error.message);
        throw error;
      }

      // If this is not a rate limit error, don't retry
      if (!isRateLimitError(error)) {
        logger.error(`[AI] Non-rate-limit error encountered, not retrying:`, error);
        throw error;
      }

      // If we've exhausted our retries, throw the last error
      if (attempt === config.maxRetries) {
        logger.error(`[AI] Exhausted all ${config.maxRetries + 1} attempts due to rate limiting`);
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelayMs
      );

      logger.info(`[AI] Rate limited, waiting ${delay}ms before retry ${attempt + 2}/${config.maxRetries + 1}`);
      await sleep(delay);
    }
  }

  // This should never be reached, but just in case
  throw lastError;
};

/**
 * Clean markdown code blocks from AI response
 */
export const cleanMarkdownResponse = (text: string): string => {
  return text
    .replace(/^```[a-z]*\s*/i, '')
    .replace(/```$/g, '')
    .trim();
};

/**
 * Parse JSON response from AI with error handling
 */
export const parseAIJsonResponse = (text: string, fallbackValue: any = null): any => {
  try {
    const cleaned = cleanMarkdownResponse(text);
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error(`[AI] Failed to parse JSON response:`, { text, error });
    if (fallbackValue !== null) {
      return fallbackValue;
    }
    throw new Error(`Invalid JSON response from AI: ${text}`);
  }
};
