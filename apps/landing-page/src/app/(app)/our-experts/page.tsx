import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CallIcon } from '@/components/ui/icons'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import type { Expert, Service } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'

export default function OurExperts() {
  return (
    <div className="flex flex-col min-h-screen bg-accent" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14 md:py-20 lg:py-24">
          <div className="mb-10 text-center sm:mb-12 md:mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl">Our Experts</h2>
          </div>
          <ExpertsGrid />
        </div>
      </section>
    </div>
  )
}

async function ExpertsGrid() {
  const payload = await getPayloadClient()
  const experts = await payload.find({ collection: 'experts', depth: 1 })

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 ">
      {experts.docs.map((expert) => (
        <ExpertCard key={expert.id} expert={expert} />
      ))}
    </div>
  )
}

function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <div className="bg-card p-4 rounded-2xl hover:shadow-sm grid md:grid-cols-2 flex-col gap-4">
      {/* Responsive image */}
      <div className="col-span-full md:col-span-1 aspect-[4/3] w-full rounded-lg overflow-hidden relative">
        {expert.image && (
          <Image
            src={getURLFromMedia(expert.image)}
            alt={expert.expertName}
            fill
            className="object-cover object-top"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </div>

      <div className="col-span-full md:col-span-1 flex flex-col gap-3">
        <div>
          <p className="text-xl font-semibold text-accent">{expert.expertName}</p>
          <p className="text-sm text-primary-foreground">{expert.profession}</p>
        </div>

        <p className="text-sm font-semibold text-primary-foreground">
          ₹{expert.minimumFee} for {expert.sessionDuration} mins
        </p>

        <p className="text-sm text-primary-foreground/80">
          Expertise: {(expert.experties as Service[]).map((s) => s.name).join(', ')}
        </p>

        <Link href={expert.bookingLink ?? ''} target="_blank" className="mt-auto">
          <Button variant="secondary" icon={<CallIcon />} className="w-full">
            Book Session
          </Button>
        </Link>
      </div>
    </div>
  )
}
