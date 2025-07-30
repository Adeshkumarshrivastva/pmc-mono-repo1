import { Input } from '@/components/ui/input'
import { getBlogs, getServices } from '@/payload/actions'
import { OurBlog } from '@/payload/types'
import BlogCard from './blog-card'

type BlogsSectionProps = {
  data: OurBlog
}

export default async function BlogsSection({ data }: BlogsSectionProps) {
  const blogs = await getBlogs()

  const services = await getServices({})

  return (
    <div className="px-25 py-15 bg-accent h-full w-full">
      <div className="flex flex-col gap-4">
        <p className="font-semibold text-5xl">{data.title}</p>
        <p className="text-lg text-primary font-mullish" style={{ fontFamily: 'Mulish, sans-serif' }}>
          {data.description}
        </p>
      </div>

      <div className="sticky top-[200px]">
        <div className="flex justify-between py-9 gap-15">
          <div className="flex flex-col gap-6">
            <Input type="search" placeholder="Search" />
            <div className="flex flex-col gap-6">
              <p className="font-semibold text-2xl text-primary">Blog Categories</p>
              <div className="space-y-4">
                <div className="bg-card py-2 px-4 rounded-sm cursor-pointer">View All</div>
                <div className="space-y-4">
                  {services?.docs.map((service) => (
                    <p
                      key={service.id}
                      className="py-2 px-4 hover:bg-card rounded-sm cursor-pointer hover:text-primary-foreground"
                    >
                      {service.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {blogs.docs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No blogs available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.docs.map((blog) => (
                <BlogCard blog={blog} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
