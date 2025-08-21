// High-quota AI utility for heavy usage applications
import { tryMultipleModels, cleanMarkdownResponse, parseAIJsonResponse } from './aiHelpers';
import logger from './logger';

/**
 * Advanced AI request with intelligent model selection based on usage patterns
 */
export class HighQuotaAI {
  private static dailyUsageCount = 0;
  private static modelPreferences = {
    'resume-analysis': 'complex',
    'cover-letter': 'medium', 
    'resume-building': 'complex',
    'job-matching': 'complex',
    'field-grammar': 'simple',
    'summary-grammar': 'medium',
    'experience-grammar': 'medium',
    'education-grammar': 'simple',
    'skills-grammar': 'simple'
  } as const;

  /**
   * Smart AI request that optimizes for your high-usage patterns
   */
  static async makeSmartRequest(
    prompt: string,
    feature: keyof typeof HighQuotaAI.modelPreferences,
    options: { returnJSON?: boolean } = {}
  ): Promise<{ response: string; cost: number; model: string }> {
    
    this.dailyUsageCount++;
    logger.info(`[HighQuotaAI] Request #${this.dailyUsageCount} for feature: ${feature}`);

    try {
      const result = await tryMultipleModels(prompt, {}, feature);
      
      let processedResponse = result.response;
      
      // Auto-clean response based on expected format
      if (options.returnJSON) {
        try {
          // For JSON responses, extract and validate JSON
          const jsonMatch = processedResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            processedResponse = jsonMatch[0];
            JSON.parse(processedResponse); // Validate JSON
          }
        } catch (error) {
          logger.error(`[HighQuotaAI] JSON parsing failed for ${feature}:`, error);
          throw new Error(`Invalid JSON response from AI for ${feature}`);
        }
      } else {
        // For text responses, clean markdown
        processedResponse = cleanMarkdownResponse(processedResponse);
      }

      logger.info(`[HighQuotaAI] Success with ${result.model} for ${feature} (cost: $${result.cost.toFixed(6)})`);
      
      return {
        response: processedResponse,
        cost: result.cost,
        model: result.model
      };
      
    } catch (error: any) {
      logger.error(`[HighQuotaAI] Failed for feature ${feature}:`, error);
      
      // Enhanced error messages for different scenarios
      if (error.message?.includes('All available AI models have exceeded')) {
        throw new Error(
          `All AI models have reached their daily quota limits. ` +
          `With high usage across resume building, analysis, and cover letters, ` +
          `consider upgrading to a paid plan for unlimited requests. ` +
          `Current free tier provides 150 requests/day across all features.`
        );
      }
      
      throw error;
    }
  }

  /**
   * Get usage statistics and recommendations
   */
  static getUsageStats(): {
    dailyRequests: number;
    estimatedQuotaUsage: string;
    recommendation: string;
  } {
    const quotaUsagePercent = Math.min((this.dailyUsageCount / 150) * 100, 100);
    
    let recommendation = '';
    if (quotaUsagePercent > 90) {
      recommendation = 'URGENT: Consider upgrading to paid plan - you\'re using all 150 daily requests';
    } else if (quotaUsagePercent > 75) {
      recommendation = 'WARNING: High usage detected - paid plan recommended for production';
    } else if (quotaUsagePercent > 50) {
      recommendation = 'MODERATE: Monitor usage - may need upgrade soon';
    } else {
      recommendation = 'NORMAL: Current free tier sufficient for now';
    }

    return {
      dailyRequests: this.dailyUsageCount,
      estimatedQuotaUsage: `${quotaUsagePercent.toFixed(1)}% of 150 daily requests`,
      recommendation
    };
  }

  /**
   * Reset daily counter (call this at midnight or app restart)
   */
  static resetDailyCounter(): void {
    this.dailyUsageCount = 0;
    logger.info('[HighQuotaAI] Daily usage counter reset');
  }
}

// Export convenience functions for common use cases
export const analyzeResumeAI = (prompt: string) => 
  HighQuotaAI.makeSmartRequest(prompt, 'resume-analysis', { returnJSON: true });

export const generateCoverLetterAI = (prompt: string) => 
  HighQuotaAI.makeSmartRequest(prompt, 'cover-letter');

export const buildResumeAI = (prompt: string) => 
  HighQuotaAI.makeSmartRequest(prompt, 'resume-building');

export const matchJobsAI = (prompt: string) => 
  HighQuotaAI.makeSmartRequest(prompt, 'job-matching', { returnJSON: true });

export const fixGrammarAI = (prompt: string, type: 'field' | 'summary' | 'experience' = 'field') => 
  HighQuotaAI.makeSmartRequest(prompt, `${type}-grammar` as any);
