import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CircleArrowRightIcon, ChatIcon } from '@/components/ui/icons'
import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'

type BlogsSectionProps = {
  data: Home['blogsSection']
}

export default function BlogsSection({ data }: BlogsSectionProps) {
  if (!data?.featuredBlogs || data.featuredBlogs.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-9">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl md:text-5xl max-w-xl">{data?.title}</h2>

              {data?.action && (
                <Link href={'/blogs'}>
                  <Button icon={<ChatIcon />} className="w-full sm:w-auto">
                    {data.action}
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {data.featuredBlogs.map((blog) => {
                if (typeof blog === 'string') return null

                return (
                  <article
                    key={blog.id}
                    className="relative flex flex-col w-full max-w-sm mx-auto sm:max-w-none sm:mx-0"
                  >
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        fill
                        src={getURLFromMedia(blog?.image ?? '')}
                        alt={blog?.title ?? ''}
                        className="object-cover rounded-2xl"
                      />
                    </div>

                    <Link href={`/blogs/${blog.id}`}>
                      <div className="bg-card p-4 sm:p-5 rounded-3xl -mt-10 mx-3 sm:mx-4 shadow-lg lg:absolute lg:left-4 lg:right-4 lg:-bottom-4 lg:max-w-none z-10">
                        <h3 className="text-base sm:text-lg font-semibold text-primary-foreground mb-2">
                          {blog.title}
                        </h3>

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
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
