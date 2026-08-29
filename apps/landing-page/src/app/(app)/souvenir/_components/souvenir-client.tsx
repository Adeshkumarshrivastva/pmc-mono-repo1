'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, IndianRupee, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getURLFromMedia } from '@/payload/utils'
import type { Souvenir, Media } from '@/payload/types'

const USD_RATE =97
type Currency = 'INR' | 'USD'
type Product = NonNullable<Souvenir['products']>[number]

function formatPrice(price: number, currency: Currency) {
  if (currency === 'USD') return `$${(price / USD_RATE).toFixed(2)}`
  return `₹${price.toLocaleString('en-IN')}`
}

export default function SouvenirClient({ products }: { products: NonNullable<Souvenir['products']> }) {
  const [currency, setCurrency] = useState<Currency>('INR')

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        No products available yet. Check back soon!
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Currency Switcher */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 bg-muted rounded-full p-1 border">
          <button
            onClick={() => setCurrency('INR')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all',
              currency === 'INR'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <IndianRupee className="size-3.5" />
            INR
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all',
              currency === 'USD'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <DollarSign className="size-3.5" />
            USD
          </button>
        </div>
      </div>
      {/* Products Grid — 3 per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: Product, idx: number) => {
          const firstImage = product.images?.[0]?.image
          const imageUrl = firstImage ? getURLFromMedia(firstImage as string | Media) : null

          return (
            <div
              key={product.id ?? idx}
              className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col group"
            >
              {/* Image */}
              <div className="relative aspect-square bg-accent/20 overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.productName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    No image
                  </div>
                )}
              </div>
              {/* Explore More button — just below image */}
              <Link
                href={`/souvenir/${product.id}`}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Explore More
                <ArrowRight className="size-4" />
              </Link>
              {/* Name + Price */}
              <div className="p-4 flex flex-col gap-1">
                <h3 className="font-bold text-base text-foreground leading-tight">{product.productName}</h3>
                <div className="text-xl font-bold text-primary">
                  {product.price != null ? formatPrice(product.price, currency) : '—'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
