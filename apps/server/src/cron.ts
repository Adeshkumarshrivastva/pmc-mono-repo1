import type { ScheduledHandler } from 'aws-lambda'
import { cleanupStaleDraftBookings } from './lib/cleanup-draft-bookings'
import { createLogger } from './lib/logger'

const logger = createLogger('cron')

export const handler: ScheduledHandler = async (event) => {
  logger.info(`Starting scheduled cleanup of stale DRAFT bookings: ${JSON.stringify(event)}`)

  try {
    const result = await cleanupStaleDraftBookings()
    logger.info(`Successfully completed cleanup: ${JSON.stringify(result)}`)
  } catch (error) {
    logger.error(`Cleanup failed: ${JSON.stringify(error)}`)
    throw error
  }
}
