import { getBlogs } from '@/payload/actions/blogs/blogs.actions'
import { getURLFromMedia } from '@/payload/utils'
import { notFound } from 'next/navigation'
import { Blog } from '@/payload/types'
import { RichText } from '@payloadcms/richtext-lexical/react'

interface BlogDetailPageProps {
  params: { blogId: string }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const blogs = await getBlogs()
  const blog = blogs?.docs.find((b: Blog) => b.id === params.blogId)
  if (!blog) return notFound()

  return (
    <main className="w-full bg-accent">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8">
          <img
            src={getURLFromMedia(blog.image ?? '')}
            alt={blog.title}
            className="w-full rounded-2xl object-cover aspect-[4/3]"
          />
        </div>
        <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
        <div className="text-muted-foreground mb-4">
          By {blog.author} •{' '}
          {new Date(blog.publishedAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <article className="prose prose-lg max-w-none">
          {blog?.content ? (
            <div className="lg:text-lg">
              <RichText data={blog.content} disableContainer={true} />
            </div>
          ) : null}
        </article>
      </div>
    </main>
  )
}
