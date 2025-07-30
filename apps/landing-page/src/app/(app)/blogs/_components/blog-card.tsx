import { Button } from '@/components/ui/button'
import { CircleArrowRightIcon } from '@/components/ui/icons'
import { Blog } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type BlogCardProps = {
  blog: Blog
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <article key={blog.id} className="relative flex flex-col w-full max-w-sm mx-auto sm:max-w-none sm:mx-0">
      <div className="relative aspect-[16/9] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getURLFromMedia(blog?.image ?? '')}
          alt={blog?.title ?? ''}
          className="h-full w-full object-cover rounded-2xl"
        />
      </div>

      <div className="bg-card p-4 sm:p-5 rounded-3xl -mt-10 mx-3 sm:mx-4 shadow-lg lg:absolute lg:left-4 lg:right-4 lg:-bottom-4 lg:max-w-none z-10">
        <h3 className="text-base sm:text-lg font-semibold text-primary-foreground mb-2">{blog.title}</h3>

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-primary-foreground">{blog.author}</div>
            <div className="text-xs text-primary-foreground/80">
              {new Date(blog.publishedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <Button
            icon={<CircleArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-transparent hover:bg-transparent p-2 shrink-0"
          />
        </div>
      </div>
    </article>
  )
}
