import Image from 'next/image'
import Link from 'next/link'
import type { News } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { toSiteHref } from '@/lib/links'

type PrEntry = NonNullable<News['prs']>[number]

export type NewsCardItem = PrEntry & {
  id: string
  title: string
  publishedAt: string
}

export function flattenNews(docs: News[]): NewsCardItem[] {
  return docs.flatMap((doc) =>
    (doc.prs ?? []).map((pr) => ({
      ...pr,
      id: pr.id ?? `${doc.id}-${pr.media}`,
      title: doc.title,
      publishedAt: doc.publishedAt,
    })),
  )
}

export default function NewsCard({ item }: { item: NewsCardItem }) {
  const logoUrl = item.logo ? getURLFromMedia(item.logo) : null

  const content = (
    <>
      <div className="flex items-center gap-3 p-5 pb-0">
        <div className="relative size-10 shrink-0 rounded-full overflow-hidden bg-muted">
          {logoUrl && <Image src={logoUrl} alt={item.media} fill className="object-cover" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary-foreground truncate">{item.media}</p>
          {item.mediaType && <p className="text-xs text-primary-foreground/70 truncate">{item.mediaType}</p>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-primary-foreground text-lg font-semibold leading-snug tracking-tight line-clamp-2">
          {item.title}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {item.industry && (
            <span className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs text-primary-foreground/80">
              {item.industry}
            </span>
          )}
          {item.visitingCountry && (
            <span className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs text-primary-foreground/80">
              {item.visitingCountry}
            </span>
          )}
        </div>

        {item.potentialAudience && (
          <p className="mt-3 text-sm text-primary-foreground/80">{item.potentialAudience}</p>
        )}

        <p className="mt-auto pt-3 text-sm text-primary-foreground/80">
          {new Date(item.publishedAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </>
  )

  const className = 'group relative flex flex-col overflow-hidden rounded-2xl bg-card text-card-foreground'

  if (item.link) {
    return (
      <Link href={toSiteHref(item.link)} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
