import { calendar, type calendar_v3 } from '@googleapis/calendar'
import { JWT } from 'google-auth-library'
import { Resource } from 'sst'
import { config } from '../config'

const isDevelopment = Resource.App.stage !== 'production'

export function getGoogleCalendarClient() {
  const clientEmail = config.google.serviceAccountEmail
  const privateKey = atob(config.google.serviceACcountPrivateKey)

  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google service account credentials')
  }

  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n')

  const auth = new JWT({
    email: clientEmail,
    key: formattedPrivateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
    subject: config.google.calendarEmail,
  })

  return calendar({ version: 'v3', auth })
}

interface CreateMeetLinkParams {
  summary: string
  bookingId: string
  description?: string
  startDateTime: Date
  endDateTime: Date
  attendees?: string[]
  isVirtual?: boolean
  inPersonLocation?: string
  organizerEmail: string
}

export async function createGoogleCalendarEvent(params: CreateMeetLinkParams): Promise<{
  meetLink: string | null
  eventId: string
}> {
  const calendar = getGoogleCalendarClient()

  const event: calendar_v3.Schema$Event = {
    summary: params.summary,
    description: params.description,
    start: {
      dateTime: params.startDateTime.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: params.endDateTime.toISOString(),
      timeZone: 'UTC',
    },
    attendees: params.attendees?.map((email) => ({ email })),
    organizer: {
      email: params.organizerEmail,
    },
    guestsCanInviteOthers: true,
    guestsCanSeeOtherGuests: true,
    conferenceData: params.isVirtual
      ? {
          createRequest: {
            requestId: `${params.bookingId}-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        }
      : undefined,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 30 }, // Reminder 30 minutes before
        { method: 'email', minutes: 1440 }, // Reminder 24 hours before
        { method: 'popup', minutes: 10 },
      ],
    },
    location: params.isVirtual ? 'Virtual (Google Meet)' : params.inPersonLocation,
  }

  const response = await calendar.events.insert({
    calendarId: config.google.calendarEmail,
    conferenceDataVersion: 1,
    sendNotifications: true,
    requestBody: event,
  })

  let meetLink = null

  if (params.isVirtual) {
    meetLink = response.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri

    if (!meetLink) {
      throw new Error('Failed to generate Google Meet link')
    }
  }

  return {
    meetLink,
    eventId: response.data.id!,
  }
}

export async function deleteGoogleCalendarEvent(eventId: string): Promise<void> {
  const calendar = getGoogleCalendarClient()

  await calendar.events.delete({
    calendarId: isDevelopment ? config.google.calendarEmail : 'primary',
    eventId,
  })
}
