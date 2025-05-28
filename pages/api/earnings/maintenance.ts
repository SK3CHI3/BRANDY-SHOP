// API endpoint for automated earnings maintenance
// This endpoint should be called by a cron job every hour

import { NextApiRequest, NextApiResponse } from 'next'
import { earningsSchedulerService } from '@/services/earningsScheduler'

interface MaintenanceResponse {
  success: boolean
  result?: {
    pending_updated: number
    artists_affected: number
    total_amount_released: number
    execution_time: string
  }
  error?: string
  timestamp: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MaintenanceResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
      timestamp: new Date().toISOString()
    })
  }

  // Optional: Add API key authentication for security
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']
  const expectedApiKey = process.env.MAINTENANCE_API_KEY

  if (expectedApiKey && apiKey !== expectedApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Invalid API key.',
      timestamp: new Date().toISOString()
    })
  }

  try {
    // Run the scheduled maintenance
    const { result, error } = await earningsSchedulerService.runScheduledMaintenance()

    if (error) {
      return res.status(500).json({
        success: false,
        error: error,
        timestamp: new Date().toISOString()
      })
    }

    if (result) {

      return res.status(200).json({
        success: true,
        result: result,
        timestamp: new Date().toISOString()
      })
    } else {
      return res.status(200).json({
        success: true,
        result: {
          pending_updated: 0,
          artists_affected: 0,
          total_amount_released: 0,
          execution_time: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('💥 Unexpected error during maintenance:', error)
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    })
  }
}
