import { prisma } from './db'
import dayjs from './dayjs'
import { createLogger } from './logger'

const logger = createLogger('cleanup-draft-bookings')

/**
 * Deletes all DRAFT bookings that are older than 5 minutes
 * This prevents stale DRAFT bookings from blocking time slots
 */
export async function cleanupStaleDraftBookings() {
  const tenMinutesAgo = dayjs().subtract(5, 'minutes').toDate()

  try {
    const result = await prisma.booking.deleteMany({
      where: {
        status: 'DRAFT',
        createdAt: {
          lt: tenMinutesAgo,
        },
      },
    })

    logger.info(`Cleaned up ${result.count} stale DRAFT bookings`)
    return { deletedCount: result.count }
  } catch (error) {
    logger.error(`Failed to cleanup stale DRAFT bookings: ${JSON.stringify(error)}`)
    throw error
  }
}
