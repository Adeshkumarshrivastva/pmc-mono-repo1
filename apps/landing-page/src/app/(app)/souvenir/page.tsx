import { getPayloadClient } from '@/lib/payload'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import type { Souvenir } from '@/payload/types'
import SouvenirClient from './_components/souvenir-client'

export default async function SouvenirPage() {
  let souvenir: Souvenir | null = null

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'souvenirs',
      depth: 2,
      limit: 1,
      sort: 'createdAt',
    })
    souvenir = (result.docs[0] as Souvenir) ?? null
  } catch (error) {
    console.error('[SouvenirPage] Failed to load souvenirs:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: NAVBAR_HEIGHT }}>
      {/* Title section with background */}
      <div className="bg-primary text-primary-foreground py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary-foreground/50">
            Positive Mind Care
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold">
            {souvenir?.title ?? 'Our Souvenir Collection'}
          </h1>
          <p className="text-primary-foreground/70 max-w-md mx-auto text-sm">
            Thoughtfully crafted keepsakes that carry the essence of mindfulness and positive healing.
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <SouvenirClient products={souvenir?.products ?? []} />
      </div>
    </div>
  )
}
