import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import type { Souvenir } from '@/payload/types'
import ProductDetailClient from './_components/product-detail-client'

type Props = { params: Promise<{ productId: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = await params

  let souvenir: Souvenir | null = null
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({ collection: 'souvenirs', depth: 2, limit: 1 })
    souvenir = (result.docs[0] as Souvenir) ?? null
  } catch (error) {
    console.error('[ProductDetailPage] Failed to load:', error)
  }

  const product = souvenir?.products?.find((p) => p.id === productId)
  if (!product) notFound()

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: NAVBAR_HEIGHT }}>
      {/* Lightweight header strip */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link
            href="/souvenir"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="size-4" />
            Collection
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-sm font-semibold text-gray-800 truncate">{product.productName}</h1>
        </div>
      </div>

      {/* Product name heading */}
      <div className="bg-primary text-primary-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">{product.productName}</h1>
          {souvenir?.title && (
            <p className="text-primary-foreground/60 text-xs mt-1">{souvenir.title}</p>
          )}
        </div>
      </div>

      {/* Detail content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <ProductDetailClient product={product} />
      </div>
    </div>
  )
}
