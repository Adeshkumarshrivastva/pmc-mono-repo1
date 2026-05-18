import { getPayloadClient } from '@/lib/payload'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/payload/types'
import { RichText } from '@payloadcms/richtext-lexical/react'

export default async function FranchiseDetailsPage() {
  const payload = await getPayloadClient()

  const franchiseData = await payload.findGlobal({
    slug: 'franchise',
  })

  const franchise = franchiseData.franchise

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
              {franchise?.title || 'Franchise Opportunity'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              {franchise?.subtitle || 'Partner with us to make a difference'}
            </p>
          </div>

          {/* Main Image */}
          {franchise?.mainImage && (
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden mb-12">
              <Image
                src={getURLFromMedia(franchise.mainImage as Media)}
                alt={franchise.title || 'Franchise'}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-primary">About Our Franchise</h2>
              <div className="prose prose-lg max-w-none text-foreground">
                {franchise?.description ? (
                  <RichText data={franchise.description} />
                ) : (
                  <p>
                    Join the Positive Mind Care family and bring mental health wellness to your community. 
                    Our franchise model offers comprehensive support and proven systems to help you succeed.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-primary">Why Partner With Us?</h2>
              <ul className="space-y-4">
                {franchise?.benefits && franchise.benefits.length > 0 ? (
                  franchise.benefits.map((item: any, index: number) => (
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
                      <span className="text-lg text-foreground">{item.benefit}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg text-foreground">Comprehensive training program</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg text-foreground">Ongoing operational support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg text-foreground">Proven business model</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg text-foreground">Marketing and branding support</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Apply now and our team will guide you through the franchise process.
            </p>
            <Link
              href="/franchise/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg transition-all hover:scale-105"
            >
              Apply for Franchise
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
