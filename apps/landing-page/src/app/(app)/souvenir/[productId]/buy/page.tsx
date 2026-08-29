import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getURLFromMedia } from '@/payload/utils'
import type { Souvenir, Media } from '@/payload/types'
import BuyFormSection from './_components/buy-form-section'

type BuyPageProps = {
  params: Promise<{ productId: string }>
}

export default async function SouvenirBuyPage({ params }: BuyPageProps) {
  const { productId } = await params

  let souvenir: Souvenir | null = null
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({ collection: 'souvenirs', depth: 2, limit: 1 })
    souvenir = (result.docs[0] as Souvenir) ?? null
  } catch (error) {
    console.error('[SouvenirBuyPage] Failed to load:', error)
  }

  const product = souvenir?.products?.find((p) => p.id === productId)
  if (!product) notFound()

  const firstImage = product.images?.[0]?.image
  const productImage = firstImage ? getURLFromMedia(firstImage as string | Media) : null

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <BuyFormSection
        productId={productId}
        productName={product.productName}
        productPrice={product.price}
        productImage={productImage}
      />
    </div>
  )
}
