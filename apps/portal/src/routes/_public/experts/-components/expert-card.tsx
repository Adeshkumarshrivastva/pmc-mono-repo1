import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import type { Expert, Service } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

export default function OurExperts() {
  return (
    <section className="py-16 bg-gray-50" style={{ paddingTop: `calc(4rem + ${NAVBAR_HEIGHT}px)` }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Experts</h2>
        </div>
        <ExpertsGrid />
      </div>
    </section>
  )
}

async function ExpertsGrid() {
  const payload = await getPayloadClient()
  const experts = await payload.find({ collection: 'experts', depth: 1 })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {experts.docs.map((expert) => (
        <ExpertCard key={expert.id} expert={expert} />
      ))}
    </div>
  )
}

function ExpertCard({ expert }: { expert: Expert }) {
  const imageUrl = expert.photo ? getURLFromMedia(expert.photo) : '/default-avatar.jpg'

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Header with image and basic info */}
      <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
              <img src={imageUrl} alt={expert.expertName} className="w-full h-full object-cover" />
            </div>
            <button className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full hover:bg-gray-700 transition-colors">
              VIEW PROFILE
            </button>
          </div>

          {/* Name and Experience */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{expert.expertName}</h3>
            <p className="text-sm text-gray-600 mb-3">{expert.experience}+ years of experience</p>
            <div className="text-sm text-gray-700 mb-2">
              <span className="font-medium">Starts @</span>
              <div className="font-bold text-lg">
                ₹{expert.minimumFee} for {expert.sessionDuration} mins
              </div>
            </div>
          </div>
        </div>

        {/* Expertise */}
        <div className="mt-4">
          <div className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Expertise:</span>
            <span className="ml-2">{(expert.experties as Service[]).map((service) => service.name).join(', ')}</span>
          </div>

          {/* Languages */}
          {expert.languages && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">Speaks:</span>
              <span className="ml-2">{expert.languages.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Session Type Tabs */}
      <div className="px-6 pt-4">
        <div className="flex gap-2 mb-4">
          <button className="px-4 py-2 rounded-full border-2 border-orange-300 text-orange-600 bg-orange-50 font-medium text-sm">
            Online
          </button>
          <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium text-sm">
            In-person
          </button>
        </div>
      </div>

      {/* Booking Section */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Available via:</div>
            <div className="text-sm font-medium text-gray-800">
              {expert.sessionTypes?.join(', ') || 'Video, Voice, Chat'}
            </div>
            <div className="text-sm text-gray-600 mt-2">Next online slot:</div>
            <div className="text-sm text-orange-600 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Today, 12:30 PM
            </div>
          </div>

          <Button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold" asChild>
            <Link href={`/expert/${expert.slug}`}>BOOK</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
