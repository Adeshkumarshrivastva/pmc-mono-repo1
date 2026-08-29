import { getPayloadClient } from '@/lib/payload'
import NewsCard, { flattenNews } from '../_components/news-card'

export default async function NewsPage() {
  return (
    <section className="w-full bg-accent">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14 md:py-20 lg:py-24">
        <div className="mb-10 text-center sm:mb-12 md:mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl">
            Latest News
          </h2>
        </div>
        <NewsGrid />
      </div>
    </section>
  )
}

async function NewsGrid() {
  const payload = await getPayloadClient()
  const news = await payload.find({ collection: 'news', sort: '-publishedAt', depth: 2 })
  const items = flattenNews(news.docs)

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </div>
  )
}
