import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient } from '@/lib/payload'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'

interface WebinarPageProps {
  params: Promise<{ webinarId: string }>
}

export default async function WebinarPage({ params }: WebinarPageProps) {
  const { webinarId } = await params
  const payload = await getPayloadClient()
  const webinar = await payload.findByID({
    collection: 'webinars',
    id: webinarId,
  })

  if (!webinar) return notFound()

  return (
    <main className="w-full bg-accent">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {webinar.videoLink ? (
          <div className="mb-8">
            <iframe
              src={webinar.videoLink}
              title={webinar.title}
              allowFullScreen
              className="w-full rounded-2xl aspect-video"
            />
          </div>
        ) : null}
        <h1 className="text-3xl font-bold mb-2">{webinar.title}</h1>
        <p className="text-muted-foreground mb-6">
          {new Date(webinar.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {webinar.description && (
          <article className="prose prose-lg max-w-none mb-10">
            <RichText data={webinar.description} disableContainer />
          </article>
        )}

        {webinar.speaker && (
          <section aria-labelledby="speaker-title" className="space-y-3">
            <h2 id="speaker-title" className="text-xl font-semibold">
              About the speaker
            </h2>
            <div className="flex items-start gap-4 relative">
              {webinar.speaker.image ? (
                <Image
                  src={getURLFromMedia(webinar.speaker.image)}
                  alt={webinar.speaker.name ?? 'Webinar Speaker'}
                  className="rounded-full object-cover size-20"
                />
              ) : null}
              <div>
                <p className="font-medium text-lg">{webinar.speaker.name}</p>
                {webinar.speaker.profession && (
                  <p className="text-sm text-muted-foreground">{webinar.speaker.profession}</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
