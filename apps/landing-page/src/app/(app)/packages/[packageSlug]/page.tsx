import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import { CheckIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type PackagePageProps = {
  params: Promise<{
    packageSlug: string
  }>
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { packageSlug } = await params
  const payload = await getPayloadClient()

  // Fetch home data
  const homeData = await payload.findGlobal({
    slug: 'home',
  })

  // Find package
  const packageData = homeData.packagesSection?.availablePackages?.find(
    (pkg) => pkg.slug === packageSlug
  )

  if (!packageData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">

        {/* Back Button */}
        <Link
          href="/"
          className="inline-block mb-6 text-primary hover:underline text-lg"
        >
          ← Back to Home
        </Link>

        {/* Main Card */}
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">

          {/* Top Section */}
          <div className="bg-primary text-white text-center py-8 px-10">
            <h1 className="text-5xl font-bold mb-3">
              {packageData.name}
            </h1>

            <p className="text-xl max-w-4xl mx-auto leading-relaxed opacity-90">
              Empower your business with our premium solution designed to
              improve productivity, streamline workflow, and deliver better
              results for your organization.
            </p>

            <div className="mt-4 text-5xl font-bold">
              ₹ {packageData.price}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">

            {/* Intro */}
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-semibold mb-3 text-foreground">
                Why Choose This Package?
              </h2>

              <p className="text-muted-foreground leading-8 text-lg max-w-5xl mx-auto">
                This package is specially designed for businesses and
                professionals who want reliable support, quality service,
                and long-term growth. Our expert team ensures smooth
                execution and complete assistance throughout the process.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-foreground mb-4 text-center">
                Package Features
              </h3>

              {packageData.features &&
              packageData.features.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {packageData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 bg-gray-50 p-3 rounded-xl"
                    >
                      <div className="bg-primary rounded-full p-1 mt-1 flex-shrink-0">
                        <CheckIcon className="size-4 text-white" />
                      </div>

                      <span className="text-lg text-gray-700">
                        {feature.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  No features listed
                </p>
              )}
            </div>

            {/* Bottom Intro */}
            <div className="mt-6 text-center">
              <p className="text-lg text-muted-foreground leading-8 max-w-4xl mx-auto">
                Get started today and experience professional service,
                dedicated support, and complete guidance for your business
                success.
              </p>
            </div>

            {/* Book Button */}
            <div className="mt-6 flex justify-center">
              <Link
                href={`/packages/${packageSlug}/book`}
                className="inline-flex items-center justify-center px-10 py-6 text-lg rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
              >
                Book Now
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}