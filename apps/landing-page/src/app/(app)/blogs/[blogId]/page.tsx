import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getBlog } from '@/payload/actions/blogs/blogs.actions'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'

interface BlogDetailPageProps {
  params: Promise<{ blogId: string }>
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { blogId } = await params
  const blog = await getBlog({ blogId })

  if (!blog) return notFound()

  return (
    <main className="w-full bg-accent">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8 relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
          {blog.image && (
            <Image
              src={getURLFromMedia(blog.image)}
              alt={blog.title}
              fill
              className="object-cover rounded-2xl"
              priority
            />
          )}
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
