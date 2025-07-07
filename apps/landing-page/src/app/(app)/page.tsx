import { getPayloadClient } from '@/lib/payload'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const home = await payload.findGlobal({ slug: 'home' })

  return (
    <div>
      {home.heroSetion?.heroSectionTitle ? (
        <h1 className="text-3xl font-bold underline">{home.heroSetion?.heroSectionTitle}</h1>
      ) : null}
    </div>
  )
}
