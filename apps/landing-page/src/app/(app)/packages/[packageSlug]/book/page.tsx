import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import BookingFormSection from './_components/booking-form-section'

type BookingPageProps = {
  params: Promise<{
    packageSlug: string
  }>
}

export default async function PackageBookingPage({ params }: BookingPageProps) {
  const { packageSlug } = await params
  const payload = await getPayloadClient()

  const homeData = await payload.findGlobal({
    slug: 'home',
  })

  const packageData = homeData.packagesSection?.availablePackages?.find(
    (pkg) => pkg.slug === packageSlug
  )

  if (!packageData) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <BookingFormSection
        packageName={packageData.name || ''}
        packagePrice={packageData.price || ''}
        packageSlug={packageSlug}
      />
    </div>
  )
}
