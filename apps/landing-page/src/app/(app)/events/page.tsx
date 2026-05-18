import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { getURLFromMedia } from '@/payload/utils'

export default async function EventsPage() {
  const payload = await getPayloadClient()
  const data = await payload.findGlobal({
    slug: 'events',
  })

  return (
    <div className="min-h-screen bg-accent">
      <div className="max-w-[1600px] mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        {/* Page Header */}
        <div className="space-y-6 mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary">
            {data.title}
          </h1>
          
          {data.description && (
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              {data.description}
            </p>
          )}
        </div>

        {/* Images Section */}
        {data.imagesSection?.images && data.imagesSection.images.length > 0 && (
          <div className="mb-20">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                {data.imagesSection.heading}
              </h2>
              {data.imagesSection.description && (
                <p className="text-lg text-muted-foreground">
                  {data.imagesSection.description}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {data.imagesSection.images.map((item, index) => (
                <div key={item.id || index} className="group">
                  <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="relative h-64 w-full">
                      <Image
                        src={getURLFromMedia(item.image)}
                        alt={item.caption || `Event image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {item.caption && (
                      <div className="p-3">
                        <p className="text-xs sm:text-sm text-muted-foreground text-center line-clamp-2">
                          {item.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {data.videosSection?.videos && data.videosSection.videos.length > 0 && (
          <div className="mb-20">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                {data.videosSection.heading}
              </h2>
              {data.videosSection.description && (
                <p className="text-lg text-muted-foreground">
                  {data.videosSection.description}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {data.videosSection.videos.map((item, index) => (
                <div key={item.id || index} className="group">
                  <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="relative h-64 w-full">
                      <video
                        src={getURLFromMedia(item.video)}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    
                    {item.caption && (
                      <div className="p-3">
                        <p className="text-xs sm:text-sm text-muted-foreground text-center line-clamp-2">
                          {item.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!data.imagesSection?.images || data.imagesSection.images.length === 0) &&
         (!data.videosSection?.videos || data.videosSection.videos.length === 0) && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              No events or camps to display yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
