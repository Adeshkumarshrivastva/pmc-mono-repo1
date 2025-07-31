import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import Blogs from './_components/blogs'

export default async function BlogsPage() {
  const payload = await getPayloadClient()
  const ourBlogs = await payload.findGlobal({
    slug: 'our-blogs',
  })

  return (
    <div style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <Blogs data={ourBlogs} />
    </div>
  )
}
