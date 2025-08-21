// Multi-model AI strategy with fallbacks
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from './logger';

export class MultiModelAI {
  private genAI: GoogleGenerativeAI;
  
  // Model priority: fast -> balanced -> premium
  private models = [
    { name: 'gemini-1.5-flash', priority: 1, description: 'Fast, lightweight' },
    { name: 'gemini-1.5-pro', priority: 2, description: 'Balanced quality/speed' },
    { name: 'gemini-1.0-pro', priority: 3, description: 'Stable, proven' }
  ];

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Get model with fallback strategy
   */
  getModel(preferredModel?: string) {
    const modelName = preferredModel || this.models[0].name;
    logger.info(`[MultiModelAI] Using model: ${modelName}`);
    return this.genAI.getGenerativeModel({ model: modelName });
  }

  /**
   * Generate content with model fallbacks
   */
  async generateWithFallback(
    prompt: string,
    options: { 
      preferredModel?: string;
      allowFallback?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<{ text: string; modelUsed: string }> {
    const { preferredModel, allowFallback = true, maxRetries = 3 } = options;
    
    let modelsToTry = preferredModel 
      ? [{ name: preferredModel, priority: 0, description: 'User preferred' }]
      : this.models;
    
    if (allowFallback && preferredModel) {
      modelsToTry = [
        { name: preferredModel, priority: 0, description: 'User preferred' },
        ...this.models.filter(m => m.name !== preferredModel)
      ];
    }

    let lastError: any;

    for (const modelConfig of modelsToTry) {
      try {
        logger.info(`[MultiModelAI] Trying model: ${modelConfig.name}`);
        const model = this.getModel(modelConfig.name);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        logger.info(`[MultiModelAI] Success with model: ${modelConfig.name}`);
        return { text, modelUsed: modelConfig.name };
        
      } catch (error: any) {
        lastError = error;
        logger.error(`[MultiModelAI] Model ${modelConfig.name} failed:`, {
          status: error.status,
          message: error.message
        });

        // If quota exhausted on this model, try next
        if (this.isQuotaError(error)) {
          logger.info(`[MultiModelAI] Quota exhausted for ${modelConfig.name}, trying next model`);
          continue;
        }

        // If not a quota error, don't try other models
        if (!this.isRetryableError(error)) {
          throw error;
        }
      }
    }

    // All models failed
    logger.error(`[MultiModelAI] All models failed`);
    throw lastError;
  }

  private isQuotaError(error: any): boolean {
    return error.status === 429 && 
           (error.message?.includes('quota') || 
            error.message?.includes('exceeded your current quota'));
  }

  private isRetryableError(error: any): boolean {
    return error.status === 429 || error.status === 500 || error.status === 503;
  }

  /**
   * Get quota status for each model (if tracking is available)
   */
  async getModelStatus(): Promise<Array<{model: string; available: boolean; lastError?: string}>> {
    const status = [];
    
    for (const modelConfig of this.models) {
      try {
        const model = this.getModel(modelConfig.name);
        // Simple test to check if model is available
        await model.generateContent("Test");
        status.push({ model: modelConfig.name, available: true });
      } catch (error: any) {
        status.push({ 
          model: modelConfig.name, 
          available: false, 
          lastError: error.message 
        });
      }
    }
    
    return status;
  }
}

// Usage example:
/*
const multiAI = new MultiModelAI(process.env.GEMINI_API_KEY || '');

// Try preferred model with fallbacks
const result = await multiAI.generateWithFallback(prompt, {
  preferredModel: 'gemini-1.5-flash',
  allowFallback: true
});

console.log(`Generated with model: ${result.modelUsed}`);
console.log(`Response: ${result.text}`);
*/
