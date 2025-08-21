// Usage monitoring route for tracking AI quota consumption
import { Request, Response } from 'express';
import { HighQuotaAI } from '../utils/highQuotaAI';
import logger from '../utils/logger';

export const getUsageStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = HighQuotaAI.getUsageStats();
    
    logger.info('[Usage] Stats requested:', stats);
    
    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
        quotaLimits: {
          freeModel1: '50 requests/day',
          freeModel2: '50 requests/day', 
          freeModel3: '50 requests/day',
          totalFree: '150 requests/day'
        },
        upgradeInfo: {
          basicPaid: '$5-10/month for 1000+ requests/day',
          premiumPaid: '$25-50/month for unlimited requests'
        }
      }
    });
    
  } catch (error: any) {
    logger.error('[Usage] Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage statistics'
    });
  }
};

export const resetUsageCounter = async (req: Request, res: Response): Promise<void> => {
  try {
    HighQuotaAI.resetDailyCounter();
    
    logger.info('[Usage] Counter reset by request');
    
    res.json({
      success: true,
      message: 'Daily usage counter reset successfully'
    });
    
  } catch (error: any) {
    logger.error('[Usage] Error resetting counter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset usage counter'
    });
  }
};
