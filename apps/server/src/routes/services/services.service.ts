import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import { getErrorMessage } from '../../lib/utils'
import type { CreateServiceInput, DeleteServiceInput, GetServiceInput, UpdateServiceInput } from './services.input'

export async function createService(c: C, input: CreateServiceInput) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const expert = await prisma.expert.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert profile not found' }, 404)
    }

    const existingService = await prisma.service.findFirst({
      where: {
        expertId: expert.id,
        slug: input.slug,
        isDeleted: false,
      },
    })

    if (existingService) {
      return c.json({ error: 'Service with this slug already exists' }, 400)
    }

    const service = await prisma.service.create({
      data: {
        ...input,
        expertId: expert.id,
      },
    })

    return c.json({
      success: true,
      service,
    })
  } catch (error) {
    return c.json({ error: `Failed to create service - ${getErrorMessage(error)}` }, 500)
  }
}

export async function updateService(c: C, input: UpdateServiceInput) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const expert = await prisma.expert.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert profile not found' }, 404)
    }

    const existingService = await prisma.service.findUnique({
      where: { id: input.serviceId },
      select: { expertId: true, isDeleted: true },
    })

    if (!existingService) {
      return c.json({ error: 'Service not found' }, 404)
    }

    if (existingService.expertId !== expert.id) {
      return c.json({ error: 'Unauthorized to update this service' }, 403)
    }

    if (existingService.isDeleted) {
      return c.json({ error: 'Cannot update deleted service' }, 400)
    }

    if (input.slug) {
      const slugConflict = await prisma.service.findFirst({
        where: {
          expertId: expert.id,
          slug: input.slug,
          isDeleted: false,
          id: { not: input.serviceId },
        },
      })

      if (slugConflict) {
        return c.json({ error: 'Service with this slug already exists' }, 400)
      }
    }

    const { serviceId, ...updateData } = input

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    })

    return c.json({
      success: true,
      service: updatedService,
    })
  } catch (error) {
    return c.json({ error: `Failed to update service - ${getErrorMessage(error)}` }, 500)
  }
}

export async function deleteService(c: C, input: DeleteServiceInput) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const expert = await prisma.expert.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert profile not found' }, 404)
    }

    const service = await prisma.service.findUnique({
      where: { id: input.serviceId },
      select: { expertId: true, isDeleted: true },
    })

    if (!service) {
      return c.json({ error: 'Service not found' }, 404)
    }

    if (service.expertId !== expert.id) {
      return c.json({ error: 'Unauthorized to delete this service' }, 403)
    }

    if (service.isDeleted) {
      return c.json({ error: 'Service already deleted' }, 400)
    }

    const activeBookings = await prisma.booking.count({
      where: {
        serviceId: input.serviceId,
        status: { in: ['BOOKED', 'DRAFT'] },
      },
    })

    if (activeBookings > 0) {
      return c.json({ error: 'Cannot delete service with active bookings' }, 400)
    }

    await prisma.service.update({
      where: { id: input.serviceId },
      data: { isDeleted: true },
    })

    return c.json({
      success: true,
      message: 'Service deleted successfully',
    })
  } catch (error) {
    return c.json({ error: `Failed to delete service - ${getErrorMessage(error)}` }, 500)
  }
}

export async function getService(c: C, input: GetServiceInput) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: input.serviceId },
      include: {
        expert: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            city: true,
            country: true,
          },
        },
      },
    })

    if (!service) {
      return c.json({ error: 'Service not found' }, 404)
    }

    if (service.isDeleted) {
      return c.json({ error: 'Service has been deleted' }, 404)
    }

    return c.json({
      success: true,
      service,
    })
  } catch (error) {
    return c.json({ error: `Failed to get service - ${getErrorMessage(error)}` }, 500)
  }
}

export async function getExpertServices(c: C) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const expert = await prisma.expert.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert profile not found' }, 404)
    }

    const services = await prisma.service.findMany({
      where: {
        expertId: expert.id,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    return c.json({
      success: true,
      services,
    })
  } catch (error) {
    return c.json({ error: `Failed to get services - ${getErrorMessage(error)}` }, 500)
  }
}
