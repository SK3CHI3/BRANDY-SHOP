// API endpoint for earnings system statistics
// Provides real-time system health and performance metrics

import { NextApiRequest, NextApiResponse } from 'next'
import { earningsSchedulerService } from '@/services/earningsScheduler'

interface StatisticsResponse {
  success: boolean
  statistics?: {
    total_artists: number
    total_earnings: number
    pending_earnings: number
    available_earnings: number
    withdrawn_earnings: number
    pending_withdrawals: number
    completed_withdrawals: number
  }
  maintenance_status?: {
    needed: boolean
    pending_count: number
  }
  recent_activity?: any[]
  error?: string
  timestamp: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatisticsResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
      timestamp: new Date().toISOString()
    })
  }

  try {
    // Get comprehensive statistics
    const { statistics, error: statsError } = await earningsSchedulerService.getEarningsStatistics()
    
    if (statsError) {
      return res.status(500).json({
        success: false,
        error: statsError,
        timestamp: new Date().toISOString()
      })
    }

    // Check if maintenance is needed
    const { needed, count, error: maintenanceError } = await earningsSchedulerService.isMaintenanceNeeded()
    
    // Get recent activity (optional, based on query parameter)
    let recentActivity = undefined
    if (req.query.include_activity === 'true') {
      const limit = parseInt(req.query.limit as string) || 10
      const { activities } = await earningsSchedulerService.getRecentEarningsActivity(limit)
      recentActivity = activities
    }

    return res.status(200).json({
      success: true,
      statistics: statistics || undefined,
      maintenance_status: maintenanceError ? undefined : {
        needed,
        pending_count: count
      },
      recent_activity: recentActivity,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching earnings statistics:', error)
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      timestamp: new Date().toISOString()
    })
  }
}
