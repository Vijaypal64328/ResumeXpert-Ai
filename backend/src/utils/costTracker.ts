// Cost tracking and budget management utility
import logger from './logger';

export interface ModelPricing {
  inputCostPer1M: number;  // Cost per 1M input tokens
  outputCostPer1M: number; // Cost per 1M output tokens
  name: string;
}

export class CostTracker {
  private static readonly MODEL_PRICING: Record<string, ModelPricing> = {
    'gemini-1.5-flash': {
      name: 'Gemini 1.5 Flash',
      inputCostPer1M: 0.075,
      outputCostPer1M: 0.30
    },
    'gemini-1.5-pro': {
      name: 'Gemini 1.5 Pro', 
      inputCostPer1M: 3.50,
      outputCostPer1M: 10.50
    },
    'gemini-1.0-pro': {
      name: 'Gemini 1.0 Pro',
      inputCostPer1M: 0.50,
      outputCostPer1M: 1.50
    }
  };

  /**
   * Calculate cost for a specific request
   */
  static calculateRequestCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = this.MODEL_PRICING[model];
    if (!pricing) {
      logger.info(`[CostTracker] Unknown model pricing: ${model}`);
      return 0;
    }

    const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPer1M;
    
    return inputCost + outputCost;
  }

  /**
   * Estimate tokens from text (rough approximation)
   */
  static estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 0.75 words
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 0.75);
  }

  /**
   * Calculate cost for text input/output
   */
  static calculateTextCost(
    model: string,
    inputText: string,
    outputText: string
  ): number {
    const inputTokens = this.estimateTokens(inputText);
    const outputTokens = this.estimateTokens(outputText);
    
    return this.calculateRequestCost(model, inputTokens, outputTokens);
  }

  /**
   * Get cost-optimized model recommendation
   */
  static recommendModel(
    inputText: string,
    complexity: 'simple' | 'medium' | 'complex' = 'medium'
  ): { model: string; estimatedCost: number; reasoning: string } {
    const inputTokens = this.estimateTokens(inputText);
    const estimatedOutputTokens = Math.min(inputTokens * 0.5, 1000); // Conservative estimate

    const models = Object.keys(this.MODEL_PRICING);
    const recommendations = models.map(model => {
      const cost = this.calculateRequestCost(model, inputTokens, estimatedOutputTokens);
      return { model, cost, pricing: this.MODEL_PRICING[model] };
    });

    // Sort by cost
    recommendations.sort((a, b) => a.cost - b.cost);

    // Choose based on complexity and cost
    let selectedModel: typeof recommendations[0];
    let reasoning: string;

    if (complexity === 'simple') {
      selectedModel = recommendations[0]; // Cheapest (Flash)
      reasoning = 'Simple task - using most cost-effective model';
    } else if (complexity === 'complex') {
      selectedModel = recommendations.find(r => r.model.includes('pro')) || recommendations[0];
      reasoning = 'Complex task - using higher quality model despite cost';
    } else {
      // Medium complexity - balance cost and quality
      selectedModel = recommendations[1] || recommendations[0];
      reasoning = 'Medium complexity - balancing cost and quality';
    }

    return {
      model: selectedModel.model,
      estimatedCost: selectedModel.cost,
      reasoning
    };
  }

  /**
   * Check if request fits within daily budget
   */
  static checkBudget(
    dailyBudget: number,
    currentDailyCost: number,
    estimatedRequestCost: number
  ): { canProceed: boolean; remainingBudget: number; warningLevel: 'none' | 'low' | 'critical' } {
    const projectedCost = currentDailyCost + estimatedRequestCost;
    const remainingBudget = dailyBudget - projectedCost;
    const usagePercentage = (projectedCost / dailyBudget) * 100;

    let warningLevel: 'none' | 'low' | 'critical' = 'none';
    if (usagePercentage > 90) warningLevel = 'critical';
    else if (usagePercentage > 75) warningLevel = 'low';

    return {
      canProceed: projectedCost <= dailyBudget,
      remainingBudget: Math.max(0, remainingBudget),
      warningLevel
    };
  }

  /**
   * Get pricing information for all models
   */
  static getPricingInfo(): Record<string, ModelPricing> {
    return { ...this.MODEL_PRICING };
  }

  /**
   * Format cost for display
   */
  static formatCost(cost: number): string {
    if (cost < 0.01) return `$${(cost * 1000).toFixed(2)}‰`; // Show in thousandths
    return `$${cost.toFixed(4)}`;
  }
}

// Usage examples:
/*
// 1. Calculate cost for a request
const cost = CostTracker.calculateTextCost(
  'gemini-1.5-flash',
  'Fix this text: Hello world',
  'Hello, world!'
);
console.log(`Request cost: ${CostTracker.formatCost(cost)}`);

// 2. Get model recommendation
const recommendation = CostTracker.recommendModel(
  'Please analyze this resume and provide feedback',
  'complex'
);
console.log(`Recommended: ${recommendation.model} (${CostTracker.formatCost(recommendation.estimatedCost)})`);

// 3. Check budget
const budget = CostTracker.checkBudget(5.00, 2.50, 0.10);
if (!budget.canProceed) {
  console.log('Daily budget exceeded!');
}
*/
