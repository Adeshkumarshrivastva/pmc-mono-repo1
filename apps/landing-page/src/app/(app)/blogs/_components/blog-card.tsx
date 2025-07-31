import { Button } from '@/components/ui/button'
import { CircleArrowRightIcon } from '@/components/ui/icons'
import { Blog } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type BlogCardProps = {
  blog: Blog
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="relative flex flex-col w-full max-w-sm mx-auto sm:max-w-none sm:mx-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
        <img src={getURLFromMedia(blog?.image ?? '')} alt={blog?.title ?? ''} className="h-full w-full object-cover" />
      </div>

      <div className="bg-card rounded-3xl p-7 -mt-10 mx-3 sm:mx-4 shadow-lg lg:absolute lg:left-3 lg:-right-6 lg:-bottom-16 lg:max-w-none lg:min-h-[160px] lg:flex lg:flex-col lg:justify-between z-10">
        <h3 className="text-base sm:text-lg text-primary-foreground mb-4 font-medium lg:line-clamp-2">{blog.title}</h3>

        <div className="flex items-center justify-between gap-2 lg:mt-auto">
          <div className="flex-1 min-w-0">
            <div className="text-base text-primary-foreground" style={{ fontFamily: 'Mulish, sans-serif' }}>
              {blog.author}
            </div>
            <div className="text-xs text-primary-foreground/80">
              {new Date(blog.publishedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <Button
            icon={<CircleArrowRightIcon className="w-5 h-5 sm:w-7 sm:h-7" />}
            className="bg-transparent hover:bg-transparent p-2 shrink-0"
          />
        </div>
      </div>
    </article>
  )
}
