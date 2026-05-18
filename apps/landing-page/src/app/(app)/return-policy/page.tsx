import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { NAVBAR_HEIGHT } from '@/lib/constants'

export default async function ReturnPolicyPage() {
  const payload = await getPayloadClient()
  const data = await payload.findGlobal({
    slug: 'return-policy',
  })

  return (
    <div className="flex flex-col min-h-screen bg-accent" style={{ minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}>
      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            {data.title}
          </h1>
          {data.lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last Updated: {new Date(data.lastUpdated).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:text-primary prose-p:text-foreground prose-li:text-foreground prose-strong:text-primary">
          {data.content ? (
            <RichText data={data.content} />
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">
                Return policy content will be added soon.
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-12 pt-8 border-t border-border">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
