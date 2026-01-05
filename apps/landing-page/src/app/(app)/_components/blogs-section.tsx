import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CircleArrowRightIcon, ChatIcon } from '@/components/ui/icons'
import type { Home, Blog } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type BlogsSectionProps = {
  data: Home['blogsSection']
  blogs: Blog[]
}

export default function BlogsSection({ data, blogs }: BlogsSectionProps) {
  if (!blogs || blogs.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-10 sm:px-6 sm:py-14 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-foreground max-w-xl">{data?.title}</h2>

            {data?.action && (
              <Link href="/blogs">
                <Button icon={<ChatIcon />} className="w-full sm:w-auto">
                  {data.action}
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {blogs.map((blog) => (
              <article key={blog.id} className="flex flex-col w-full max-w-sm mx-auto sm:max-w-none sm:mx-0">
                <div className="relative aspect-[16/9] w-full mb-4">
                  <Image
                    fill
                    src={getURLFromMedia(blog?.image ?? '')}
                    alt={blog?.title ?? ''}
                    className="object-cover rounded-2xl"
                  />
                </div>

                <Link href={`/blogs/${blog.slug}`} className="flex flex-1">
                  <div className="bg-card flex flex-col justify-between flex-1 rounded-3xl shadow-lg p-5 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-primary-foreground mb-4 line-clamp-2">
                      {blog.title}
                    </h3>

                    <div className="flex items-center justify-between gap-3 mt-auto">
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
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
