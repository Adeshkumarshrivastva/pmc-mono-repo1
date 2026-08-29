'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getBlogs, getServices } from '@/payload/actions'
import type { OurBlog } from '@/payload/types'
import { cn } from '@/lib/utils'
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet'
import BlogCard from './blog-card'

type BlogsProps = {
  data: OurBlog
}

export default function Blogs({ data }: BlogsProps) {
  const [blogs, setBlogs] = useState<any>({ docs: [], totalPages: 0, totalDocs: 0 })
  const [services, setServices] = useState<any>({ docs: [] })
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('View All')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [blogsData, servicesData] = await Promise.all([
        getBlogs({
          page: currentPage,
          limit: 6,
          search: searchQuery || undefined,
          category: selectedCategory !== 'View All' ? selectedCategory : undefined,
        }),
        getServices({}),
      ])
      setBlogs(blogsData)
      setServices(servicesData)
      setLoading(false)
    }
    fetchData()
  }, [currentPage, searchQuery, selectedCategory])

  const filteredBlogs = blogs.docs

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 3
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(blogs.totalPages, startPage + maxVisiblePages - 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <div
          key={i}
          onClick={() => handlePageChange(i)}
          className={cn(
            'w-8 h-8 sm:w-10 sm:h-10 border-none flex justify-center items-center cursor-pointer text-sm sm:text-base ',
            currentPage === i ? 'text-accent-foreground' : 'opacity-25',
          )}
        >
          {i}
        </div>,
      )
    }
    return pages
  }

  return (
    <div className="w-full min-h-full bg-accent">
      <div className="px-4 sm:px-6 md:px-8  py-8 sm:py-10 md:py-12 lg:pt-15 lg:pb-12 xl:max-w-screen-xl xl:mx-auto">
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-9">
          <h1 className="font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">{data.title}</h1>
          <p
            className="text-base sm:text-lg text-primary font-mullish max-w-4xl"
            style={{ fontFamily: 'Mulish, sans-serif' }}
          >
            {data.description}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 xl:gap-15">
          <div className="w-full lg:w-80 lg:max-w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-30 lg:h-fit lg:z-10">
              <div className="flex lg:flex-col gap-4 sm:gap-6">
                <Input
                  type="search"
                  placeholder="Search"
                  className="border border-primary text-base sm:text-lg lg:text-xl h-10 sm:h-11 lg:h-12 w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  style={{ fontFamily: 'Mulish, sans-serif' }}
                />

                <div className="lg:hidden w-full">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        className="w-full border border-primary text-base sm:text-lg h-10 sm:h-11 lg:h-12 text-left"
                        style={{ fontFamily: 'Mulish, sans-serif' }}
                      >
                        <span className="flex items-center justify-between w-full">
                          <span className="block max-w-[80px] truncate" title={selectedCategory || 'Select Category'}>
                            {selectedCategory || 'Select Category'}
                          </span>
                          <ChevronDown className="ml-2 w-4 h-4 shrink-0" />
                        </span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="p-0 max-h-[70vh] overflow-y-auto rounded-t-xl">
                      <div className="p-4">
                        <h2 className="font-semibold text-xl sm:text-2xl text-primary mb-4">Blog Categories</h2>
                        <div className="space-y-2 sm:space-y-4 overflow-auto max-h-[50vh]">
                          <SheetClose asChild>
                            <div
                              className={cn(
                                'py-2 px-3 sm:px-4 rounded-sm cursor-pointer truncate text-sm sm:text-base transition-colors',
                                selectedCategory === 'View All'
                                  ? 'bg-card text-primary-foreground'
                                  : 'hover:bg-card hover:text-primary-foreground text-primary',
                              )}
                              onClick={() => handleCategoryChange('View All')}
                              title="View All"
                            >
                              View All
                            </div>
                          </SheetClose>
                          <div className="space-y-2 sm:space-y-4">
                            {services?.docs.map((service: any) => (
                              <SheetClose asChild key={service.id}>
                                <div
                                  className={cn(
                                    'py-2 px-3 sm:px-4 rounded-sm cursor-pointer truncate text-sm sm:text-base transition-colors',
                                    selectedCategory === service.name
                                      ? 'bg-card text-primary-foreground'
                                      : 'hover:bg-card hover:text-primary-foreground text-primary',
                                  )}
                                  onClick={() => handleCategoryChange(service.name)}
                                  title={service.name}
                                >
                                  {service.name}
                                </div>
                              </SheetClose>
                            ))}
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="hidden lg:flex flex-col gap-4 sm:gap-6">
                  <h2 className="font-semibold text-xl sm:text-2xl text-primary">Blog Categories</h2>
                  <div className="space-y-2 sm:space-y-4 overflow-auto max-h-[500px]">
                    <div
                      className={cn(
                        'py-2 px-3 sm:px-4 rounded-sm cursor-pointer truncate text-sm sm:text-base transition-colors',
                        selectedCategory === 'View All'
                          ? 'bg-card text-primary-foreground'
                          : 'hover:bg-card hover:text-primary-foreground text-primary',
                      )}
                      onClick={() => handleCategoryChange('View All')}
                      title="View All"
                    >
                      View All
                    </div>

                    <div className="space-y-2 sm:space-y-4">
                      {services?.docs.map((service: any) => (
                        <div
                          key={service.id}
                          className={cn(
                            'py-2 px-3 sm:px-4 rounded-sm cursor-pointer truncate text-sm sm:text-base transition-colors',
                            selectedCategory === service.name
                              ? 'bg-card text-primary-foreground'
                              : 'hover:bg-card hover:text-primary-foreground text-primary',
                          )}
                          onClick={() => handleCategoryChange(service.name)}
                          title={service.name}
                        >
                          {service.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-600 text-base sm:text-lg">Loading blogs...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-600 text-base sm:text-lg">
                  {searchQuery ? `No blogs found matching "${searchQuery}"` : 'No blogs available yet.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 gap-y-6 sm:gap-y-8 lg:gap-y-12 xl:gap-y-23">
                  {filteredBlogs.map((blog: any) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="sm:mt-10 lg:mt-18 flex justify-center lg:justify-end">
          {blogs.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 rounded-full h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>

              <div className="flex items-center gap-1 sm:gap-2">{renderPageNumbers()}</div>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === blogs.totalPages}
                className="flex items-center gap-2 h-8 w-8 sm:h-9 sm:w-9 rounded-full"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
