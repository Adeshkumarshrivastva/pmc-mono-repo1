import { RichText } from '@payloadcms/richtext-lexical/react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'

export default async function PrivacyPolicyPage() {
  const payload = await getPayloadClient()
  const tnc = await payload.findGlobal({
    slug: 'terms-and-conditions',
  })

  if (!tnc) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <section className="w-full bg-accent">
        <div className="px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-20 lg:px-12 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-primary text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl lg:text-6xl text-center">
              {tnc.title}
            </h2>
            {tnc.hero?.headline && <p className="mt-4 text-xl text-gray-600">{tnc.hero.headline}</p>}
            {tnc.hero?.subhead && <p className="mt-2 text-gray-500">{tnc.hero.subhead}</p>}

            {tnc.lastUpdated && (
              <p className="mt-6 text-sm text-gray-500">
                Last updated: {new Date(tnc.lastUpdated).toLocaleDateString()}
              </p>
            )}

            <article className="prose prose-sm sm:prose-base lg:prose-lg  mt-12 max-w-none">
              <RichText data={tnc.content!} />
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
