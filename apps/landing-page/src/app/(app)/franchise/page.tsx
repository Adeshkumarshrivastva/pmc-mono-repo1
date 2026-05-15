import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/payload/types'
import FranchiseFormSection from './_components/franchise-form-section'
import { RichText } from '@payloadcms/richtext-lexical/react'

export default async function Page() {
  const payload = await getPayloadClient()
  const { franchise } = await payload.findGlobal({
    slug: 'franchise',
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Image */}
      {franchise?.mainImage && (
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px]">
          <Image
            src={getURLFromMedia(franchise.mainImage as Media)}
            alt={franchise.title || 'Franchise'}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                {franchise.title || 'Franchise Opportunity'}
              </h1>
              <p className="text-xl sm:text-2xl max-w-3xl mx-auto">
                {franchise.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      {franchise?.benefits && franchise.benefits.length > 0 && (
        <section className="w-full bg-background py-12 sm:py-16 lg:py-20">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mx-auto max-w-7xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-8 text-center">
              Why Partner With Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {franchise.benefits.map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-accent rounded-xl">
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
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Description Section */}
      {franchise?.description && (
        <section className="w-full bg-accent py-12 sm:py-16 lg:py-20">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mx-auto max-w-4xl">
            <RichText data={franchise.description} />
          </div>
        </section>
      )}

      {/* Form Section */}
      <FranchiseFormSection data={franchise} />

      {/* CTA to Book */}
      <section className="w-full bg-primary py-12 sm:py-16">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Your Franchise Journey?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            Submit your inquiry and our team will guide you through the process.
          </p>
          <Link
            href="/franchise/book"
            className="inline-flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 text-lg font-semibold shadow-lg transition-all hover:scale-105"
          >
            Apply for Franchise
          </Link>
        </div>
      </section>
    </div>
  )
}
