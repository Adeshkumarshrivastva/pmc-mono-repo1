import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Home } from '@/payload/types'
import NewsCard, { type NewsCardItem } from './news-card'

type NewsSectionProps = {
  data: Home['newsSection']
  news: NewsCardItem[]
}

export default function NewsSection({ data, news }: NewsSectionProps) {
  if (!news || news.length === 0) return null

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-10 sm:px-6 sm:py-14 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-foreground max-w-xl">
              {data?.title || 'Latest News'}
            </h2>

            <Link href="/news">
              <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-full hover:bg-primary/90 transition-colors shrink-0">
                {data?.action || 'View All News'}
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
