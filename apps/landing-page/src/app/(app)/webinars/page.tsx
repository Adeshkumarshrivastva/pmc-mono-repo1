import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { getURLFromMedia } from '@/payload/utils'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import type { Webinar } from '@/payload/types'
import Image from 'next/image'

export default async function WebinarsPage() {
  return (
    <section className="w-full bg-accent">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14 md:py-20 lg:py-24">
        <div className="mb-10 text-center sm:mb-12 md:mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl">
            Explore Our Webinars
          </h2>
        </div>
        <WebinarGrid />
      </div>
    </section>
  )
}

async function WebinarGrid() {
  const payload = await getPayloadClient()
  const webinars = await payload.find({ collection: 'webinars', sort: '-date' })

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {webinars.docs.map((webinar) => (
        <WebinarCard key={webinar.id} webinar={webinar} />
      ))}
    </div>
  )
}

function WebinarCard({ webinar }: { webinar: Webinar }) {
  const href = `/webinars/${webinar.slug}`
  const date = new Date(webinar.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link href={href} className="group relative flex flex-col overflow-hidden rounded-2xl bg-card text-card-foreground">
      <AspectRatio ratio={16 / 9} className="bg-muted">
        {webinar.poster && (
          <Image
            src={getURLFromMedia(webinar.poster)}
            alt={webinar.title}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:duration-0"
          />
        )}
      </AspectRatio>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-primary-foreground text-lg font-semibold leading-snug tracking-tight">{webinar.title}</h3>
        <p className="mt-1 text-sm text-primary-foreground/80">{webinar.speaker?.name}</p>
        <p className="mt-auto pt-3 text-sm text-primary-foreground/80">{date}</p>
      </div>
    </Link>
  )
}
