import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import FranchiseFormSection from './_components/franchise-form-section'

export default async function Page() {
  const payload = await getPayloadClient()
  const { franchise } = await payload.findGlobal({
    slug: 'franchise',
  })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <FranchiseFormSection data={franchise} />
    </div>
  )
}
