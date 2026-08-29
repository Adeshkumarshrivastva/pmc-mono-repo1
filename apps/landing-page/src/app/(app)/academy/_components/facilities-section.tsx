import Link from 'next/link'
import { ExternalLink, Video, BookOpen, MonitorPlay, Layers, School } from 'lucide-react'

const FACILITIES = [
  {
    icon: Video,
    title: 'Webinar',
    description:
      'Live interactive sessions with expert instructors. Join from anywhere and participate in real-time discussions on mental health and wellness.',
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    icon: BookOpen,
    title: 'Online Course',
    description:
      'Self-paced structured courses with video lectures, quizzes, and certificates — learn on your own schedule, from anywhere.',
    accent: 'bg-violet-50 text-violet-600',
  },
  {
    icon: MonitorPlay,
    title: 'Online Class',
    description:
      'Scheduled live classes with a cohort of peers. Structured sessions that deliver a real classroom experience, online.',
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Layers,
    title: 'Hybrid Course',
    description:
      'The best of both worlds — combine online and in-person learning with flexible formats that fit your lifestyle.',
    accent: 'bg-orange-50 text-orange-600',
  },
  {
    icon: School,
    title: 'Offline Course',
    description:
      'Traditional classroom learning at our centre. Face-to-face instruction with expert faculty for hands-on experience.',
    accent: 'bg-rose-50 text-rose-600',
  },
]

export default function FacilitiesSection() {
  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">What We Offer</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Multiple ways to learn and grow — choose the format that best fits your lifestyle.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FACILITIES.map((facility) => {
            const Icon = facility.icon
            return (
              <div
                key={facility.title}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={`size-10 rounded-lg flex items-center justify-center ${facility.accent}`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{facility.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{facility.description}</p>
              </div>
            )
          })}
        </div>

        {/* For more info — single button at the bottom */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm mb-4">
            For more information about our courses and programs, visit our LMS platform.
          </p>
          <Link
            href="https://academy.positivemindcare.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-7 py-3 rounded-full hover:bg-primary/90 transition-all text-sm"
          >
            For More Info — Visit our Website
            <ExternalLink className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
