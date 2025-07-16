import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, ChatIcon } from '@/components/ui/icons'
import { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type BlogsSectionProps = {
  data: Home['blogsSection']
}

export default function BlogsSection({ data }: BlogsSectionProps) {
  if (!data?.featuredBlogs || data.featuredBlogs.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-9">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl max-w-md">{data?.title}</h2>
              {data?.action && (
                <Button icon={<ChatIcon />} className="w-full sm:w-auto">
                  {data.action}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7">
              {data.featuredBlogs.map((blog) => {
                if (typeof blog === 'string') {
                  return null
                }

                return (
                  <div key={blog.id} className="relative">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getURLFromMedia(blog?.image ?? '')}
                        alt={blog?.title ?? ''}
                        width={384}
                        height={360}
                        className="h-full w-full object-cover rounded-2xl"
                      />
                    </div>

                    <div className="bg-card p-4 sm:p-6 md:p-8 rounded-3xl absolute left-3 sm:left-4 md:left-6 top-48 sm:top-52 md:top-64 right-3 sm:right-4 md:right-auto max-w-none sm:max-w-sm">
                      <h3 className="text-base sm:text-xl text-primary-foreground font-medium mb-2">{blog.title}</h3>

                      <div className="flex justify-between items-center gap-2 opacity-80">
                        <div className="flex-1 min-w-0">
                          <div className="text-primary-foreground">{blog.author}</div>
                          <div className="text-xs sm:text-sm text-primary-foreground/80">
                            {new Date(blog.publishedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        </div>

                        <Button
                          icon={<ArrowRightIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />}
                          className="bg-transparent hover:bg-transparent p-2 flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
