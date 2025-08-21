// Optional quota tracking utility for development
import { db } from '../config/firebase.config';
import admin from 'firebase-admin';
import logger from './logger';

interface QuotaUsage {
  date: string;
  requestCount: number;
  lastUpdated: admin.firestore.Timestamp;
}

export class QuotaTracker {
  private static readonly COLLECTION_NAME = 'aiQuotaUsage';
  private static readonly FREE_TIER_DAILY_LIMIT = 45; // Leave some buffer from 50

  /**
   * Check if we're approaching quota limits (development use)
   */
  static async checkQuotaStatus(): Promise<{ canProceed: boolean; remainingQuota: number }> {
    try {
      const today = new Date().toDateString();
      const quotaDoc = await db.collection(this.COLLECTION_NAME).doc(today).get();
      
      if (!quotaDoc.exists) {
        return { canProceed: true, remainingQuota: this.FREE_TIER_DAILY_LIMIT };
      }

      const data = quotaDoc.data() as QuotaUsage;
      const remaining = this.FREE_TIER_DAILY_LIMIT - (data.requestCount || 0);
      
      return {
        canProceed: remaining > 0,
        remainingQuota: Math.max(0, remaining)
      };
    } catch (error) {
      logger.error('[QuotaTracker] Error checking quota status:', error);
      // On error, allow the request but log the issue
      return { canProceed: true, remainingQuota: this.FREE_TIER_DAILY_LIMIT };
    }
  }

  /**
   * Track an AI request (development use)
   */
  static async trackRequest(endpoint: string): Promise<void> {
    try {
      const today = new Date().toDateString();
      const docRef = db.collection(this.COLLECTION_NAME).doc(today);
      
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        
        if (!doc.exists) {
          transaction.set(docRef, {
            date: today,
            requestCount: 1,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            endpoints: { [endpoint]: 1 }
          });
        } else {
          const data = doc.data() as QuotaUsage & { endpoints?: Record<string, number> };
          const newCount = (data.requestCount || 0) + 1;
          const endpoints = data.endpoints || {};
          endpoints[endpoint] = (endpoints[endpoint] || 0) + 1;
          
          transaction.update(docRef, {
            requestCount: newCount,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            endpoints
          });
        }
      });
      
      logger.info(`[QuotaTracker] Tracked request for ${endpoint}`);
    } catch (error) {
      logger.error('[QuotaTracker] Error tracking request:', error);
      // Don't fail the main request if tracking fails
    }
  }

  /**
   * Get today's usage summary
   */
  static async getTodayUsage(): Promise<{ requestCount: number; remainingQuota: number }> {
    try {
      const today = new Date().toDateString();
      const quotaDoc = await db.collection(this.COLLECTION_NAME).doc(today).get();
      
      if (!quotaDoc.exists) {
        return { requestCount: 0, remainingQuota: this.FREE_TIER_DAILY_LIMIT };
      }

      const data = quotaDoc.data() as QuotaUsage;
      const requestCount = data.requestCount || 0;
      const remainingQuota = Math.max(0, this.FREE_TIER_DAILY_LIMIT - requestCount);
      
      return { requestCount, remainingQuota };
    } catch (error) {
      logger.error('[QuotaTracker] Error getting usage:', error);
      return { requestCount: 0, remainingQuota: this.FREE_TIER_DAILY_LIMIT };
    }
  }
}

// Example usage in controllers (optional):
/*
import { QuotaTracker } from '../utils/quotaTracker';

export const someAIController = async (req: Request, res: Response) => {
  // Optional quota check
  const { canProceed, remainingQuota } = await QuotaTracker.checkQuotaStatus();
  
  if (!canProceed) {
    return res.status(429).json({
      message: 'Daily AI quota limit reached. Please try again tomorrow.',
      remainingQuota: 0
    });
  }

  try {
    // Make AI request
    const result = await generateContentWithRetry(model, prompt);
    
    // Track the successful request
    await QuotaTracker.trackRequest('ai-fix-field');
    
    res.json({ result });
  } catch (error) {
    // Handle errors...
  }
};
*/
