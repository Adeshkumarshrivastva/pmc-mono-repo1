'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getBlogs, getServices } from '@/payload/actions'
import { Blog, OurBlog } from '@/payload/types'
import BlogCard from './blog-card'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type BlogsSectionProps = {
  data: OurBlog
}

export default function BlogsSection({ data }: BlogsSectionProps) {
  const [blogs, setBlogs] = useState<any>({ docs: [], totalPages: 0, totalDocs: 0 })
  const [services, setServices] = useState<any>({ docs: [] })
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('View All')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [blogsData, servicesData] = await Promise.all([getBlogs({ page: currentPage, limit: 6 }), getServices({})])
      setBlogs(blogsData)
      setServices(servicesData)
      setLoading(false)
    }
    fetchData()
  }, [currentPage])

  const filteredBlogs = blogs.docs.filter((blog: Blog) => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'View All' ||
      blog.category?.some((category) => {
        if (typeof category === 'string') {
          return category === selectedCategory
        }
        return category.name === selectedCategory
      })
    return matchesSearch && matchesCategory
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(blogs.totalPages, startPage + maxVisiblePages - 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <div
          key={i}
          onClick={() => handlePageChange(i)}
          className={cn(
            'w-10 h-10 border-none flex justify-center items-center cursor-pointer',
            currentPage === i ? 'text-accent-foreground' : '',
          )}
        >
          {i}
        </div>,
      )
    }
    return pages
  }

  return (
    <div className="px-25 py-15 bg-accent min-h-full w-full">
      <div className="flex flex-col gap-4 mb-9">
        <p className="font-semibold text-5xl">{data.title}</p>
        <p className="text-lg text-primary font-mullish" style={{ fontFamily: 'Mulish, sans-serif' }}>
          {data.description}
        </p>
      </div>

      <div className="flex justify-between gap-15">
        <div className="sticky top-30 h-fit z-10 flex-shrink-0">
          <div className="flex flex-col gap-6">
            <Input type="search" placeholder="Search" value={searchQuery} onChange={handleSearchChange} />
            <div className="flex flex-col gap-6">
              <p className="font-semibold text-2xl text-primary">Blog Categories</p>
              <div className="space-y-4">
                <div
                  className={cn(
                    'py-2 px-4 rounded-sm cursor-pointer',
                    selectedCategory === 'View All'
                      ? 'bg-card text-primary-foreground'
                      : 'hover:bg-card hover:text-primary-foreground',
                  )}
                  onClick={() => handleCategoryChange('View All')}
                >
                  View All
                </div>
                <div className="space-y-4">
                  {services?.docs.map((service: any) => (
                    <div
                      key={service.id}
                      className={cn(
                        'py-2 px-4 rounded-sm cursor-pointer',
                        selectedCategory === service.name
                          ? 'bg-card text-primary-foreground'
                          : 'hover:bg-card hover:text-primary-foreground',
                      )}
                      onClick={() => handleCategoryChange(service.name)}
                    >
                      {service.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Loading blogs...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchQuery ? `No blogs found matching "${searchQuery}"` : 'No blogs available yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-18 mb-8">
                {filteredBlogs.map((blog: any) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div>
        {blogs.totalPages > 1 && !searchQuery && selectedCategory === 'View All' && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 rounded-full h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">{renderPageNumbers()}</div>

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === blogs.totalPages}
              className="flex items-center gap-2 h-8 w-8 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
