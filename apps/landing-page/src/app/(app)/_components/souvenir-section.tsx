import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Souvenir, Media } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

export default function SouvenirSection({ souvenir }: { souvenir: Souvenir | null }) {
  if (!souvenir || !souvenir.products || souvenir.products.length === 0) return null

  const preview = souvenir.products.slice(0, 3)

  return (
    <section className="bg-primary text-primary-foreground py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-primary-foreground/50 mb-2 block">
              Exclusive Merchandise
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">{souvenir.title}</h2>
            <p className="mt-3 text-primary-foreground/70 max-w-md">
              Carry a piece of positive healing with you — handpicked mindfulness keepsakes.
            </p>
          </div>
          <Link
            href="/souvenir"
            className="inline-flex items-center gap-2 bg-primary-foreground text-primary font-semibold text-sm px-6 py-3 rounded-full hover:bg-primary-foreground/90 transition-colors shrink-0"
          >
            View Full Collection
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {preview.map((product, idx) => {
            const firstImage = product.images?.[0]?.image
            const imageUrl = firstImage ? getURLFromMedia(firstImage as string | Media) : null
            return (
              <Link
                key={product.id ?? idx}
                href="/souvenir"
                className="group bg-primary-foreground/10 hover:bg-primary-foreground/15 border border-primary-foreground/20 rounded-2xl overflow-hidden flex gap-4 p-4 transition-all hover:shadow-lg"
              >
                <div className="relative size-24 shrink-0 rounded-xl overflow-hidden bg-primary-foreground/20">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.productName}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-foreground/30 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center gap-1 min-w-0">
                  <h3 className="font-bold text-primary-foreground leading-tight truncate">{product.productName}</h3>
                  {product.price != null && (
                    <span className="text-lg font-bold text-primary-foreground/90">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            href="/souvenir"
            className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground font-semibold text-sm px-8 py-3 rounded-full hover:bg-primary-foreground/10 transition-colors"
          >
            Explore More
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
