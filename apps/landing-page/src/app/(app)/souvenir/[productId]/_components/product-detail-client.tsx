'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IndianRupee, DollarSign, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getURLFromMedia } from '@/payload/utils'
import type { Souvenir, Media } from '@/payload/types'

type Currency = 'INR' | 'USD'
type Product = NonNullable<Souvenir['products']>[number]

const FALLBACK_USD_RATE = 84

function formatPrice(priceInr: number, currency: Currency, usdRate: number) {
  if (currency === 'USD') return `$${(priceInr / usdRate).toFixed(2)}`
  return `₹${priceInr.toLocaleString('en-IN')}`
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [currency, setCurrency] = useState<Currency>('INR')
  const [activeIdx, setActiveIdx] = useState(0)
  const [usdRate, setUsdRate] = useState(FALLBACK_USD_RATE)

  const imageUrls = (product.images ?? [])
    .map((item) => getURLFromMedia(item.image as string | Media))
    .filter(Boolean) as string[]

  // Auto-slide
  useEffect(() => {
    if (imageUrls.length <= 1) return
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % imageUrls.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [imageUrls.length])

  // Live exchange rate — Frankfurter API (free, no key)
  useEffect(() => {
    fetch('https://api.frankfurter.app/latest?from=INR&to=USD')
      .then((r) => r.json())
      .then((data) => {
        const rate = data?.rates?.USD
        if (rate && rate > 0) {
          // rate = how many USD per 1 INR → we need INR per 1 USD
          setUsdRate(Math.round(1 / rate))
        }
      })
      .catch(() => {
        // silently fall back to hardcoded rate
      })
  }, [])

  const prev = () => setActiveIdx((i) => (i - 1 + imageUrls.length) % imageUrls.length)
  const next = () => setActiveIdx((i) => (i + 1) % imageUrls.length)

  return (
    <div className="space-y-10">
      {/* ── Row 1: Image + Price below (left) │ About (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left — carousel + price below */}
        <div className="space-y-4">
          {/* Image carousel */}
          <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {imageUrls.length > 0 ? (
              <>
                {imageUrls.map((url, i) => (
                  <div
                    key={i}
                    className={cn(
                      'absolute inset-0 transition-opacity duration-700 ease-in-out',
                      i === activeIdx ? 'opacity-100 z-10' : 'opacity-0 z-0',
                    )}
                  >
                    <Image
                      src={url}
                      alt={`${product.productName} — view ${i + 1}`}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                ))}
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-9 bg-black/25 hover:bg-black/45 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-9 bg-black/25 hover:bg-black/45 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No image available
              </div>
            )}
          </div>

          {/* Dot indicators */}
          {imageUrls.length > 1 && (
            <div className="flex justify-center gap-2">
              {imageUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === activeIdx ? 'w-6 h-2 bg-primary' : 'size-2 bg-gray-300 hover:bg-gray-400',
                  )}
                />
              ))}
            </div>
          )}

          {/* Price + currency switcher — just below image */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <div className="text-2xl font-bold text-primary">
              {product.price != null ? formatPrice(product.price, currency, usdRate) : '—'}
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setCurrency('INR')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                  currency === 'INR'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-gray-500 hover:text-gray-900',
                )}
              >
                <IndianRupee className="size-3" /> INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                  currency === 'USD'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-gray-500 hover:text-gray-900',
                )}
              >
                <DollarSign className="size-3" /> USD
              </button>
            </div>
          </div>

          {/* Buy Now */}
          <Link
            href={`/souvenir/${product.id}/buy`}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <ShoppingBag className="size-4" />
            Buy Now
          </Link>
        </div>

        {/* Right — About */}
        <div className="space-y-3 pt-1">
          {product.about ? (
            <>
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">About the Product</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{product.about}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm italic">No description provided.</p>
          )}
        </div>
      </div>

      {/* ── Row 2: Why Special (left) │ Specifications (right) ── */}
      {((product.whySpecial?.length ?? 0) > 0 || (product.specifications?.length ?? 0) > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {product.whySpecial && product.whySpecial.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Why This is Special</h2>
              <ul className="space-y-3">
                {product.whySpecial.map((item, i) => (
                  <li key={item.id ?? i} className="flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm leading-snug">{item.point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.specifications && product.specifications.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Specifications</h2>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr
                      key={spec.id ?? i}
                      className={cn('border-b border-gray-100 last:border-0', i % 2 === 0 ? 'bg-gray-50' : 'bg-white')}
                    >
                      <td className="py-2.5 px-3 font-semibold text-gray-800 w-2/5">{spec.key}</td>
                      <td className="py-2.5 px-3 text-gray-500">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Disclaimer (full width) ── */}
      {product.disclaimer && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-amber-700 uppercase tracking-widest">Disclaimer</h2>
            <p className="text-sm text-amber-700 leading-relaxed">{product.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  )
}
