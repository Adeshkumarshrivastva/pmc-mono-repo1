import { getPayloadClient } from '@/lib/payload'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/payload/types'

export default async function OutingPage() {
  const payload = await getPayloadClient()

  const outingData = await payload.findGlobal({
    slug: 'outing-page',
  })

  return (
    <section className="w-full min-h-screen bg-background">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="mx-auto max-w-7xl">
          {/* Back Button */}
          <Link href="/" className="inline-block text-primary hover:underline mb-8">
            ← Back to Home
          </Link>

          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6">
              {outingData.title || 'Mental Health Wellness Outing'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              {outingData.subtitle || 'Join us for a refreshing experience'}
            </p>
          </div>

          {/* Main Image */}
          {outingData.mainImage && (
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden mb-12">
              <Image
                src={getURLFromMedia(outingData.mainImage as Media)}
                alt={outingData.title || 'Outing'}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-primary">About This Outing</h2>
              <div className="prose prose-lg max-w-none text-foreground">
                {outingData.description ? (
                  <div dangerouslySetInnerHTML={{ __html: outingData.description }} />
                ) : (
                  <p>
                    Experience a transformative journey designed to promote mental wellness, relaxation, 
                    and personal growth in a supportive and nurturing environment.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-primary">What's Included</h2>
              <ul className="space-y-4">
                {outingData.features && outingData.features.length > 0 ? (
                  outingData.features.map((feature: any, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-lg text-foreground">{feature.feature}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg text-foreground">Professional guidance and support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg text-foreground">Wellness activities and workshops</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg text-foreground">Comfortable accommodation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg text-foreground">Nutritious meals</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Ready to Join Us?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book your spot now and embark on a journey towards better mental health and wellness.
            </p>
            <Link
              href="/outing/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg transition-all hover:scale-105"
            >
              Book Your Spot Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
