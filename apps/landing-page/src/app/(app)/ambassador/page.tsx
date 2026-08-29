import Link from 'next/link'
import {
  Globe,
  Users,
  Gift,
  TrendingUp,
  Award,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { NAVBAR_HEIGHT } from '@/lib/constants'

const BENEFITS = [
  {
    icon: Globe,
    title: 'Spread Awareness',
    description:
      'Represent Positive Mind Care in your community and help break the stigma around mental health.',
  },
  {
    icon: Gift,
    title: 'Exclusive Perks',
    description:
      'Enjoy special discounts on services, free access to select webinars, and exclusive merchandise.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Professionally',
    description:
      'Gain real experience in mental health advocacy, content creation, and community outreach.',
  },
  {
    icon: Award,
    title: 'Recognition & Certificate',
    description:
      'Receive an official Ambassador Certificate and be featured on our website and social channels.',
  },
  {
    icon: Users,
    title: 'Join a Community',
    description:
      'Connect with like-minded individuals passionate about mental wellness and positive change.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Mentorship',
    description:
      'Get guidance from our clinical psychologists and mental health professionals.',
  },
]

const WHO_CAN_APPLY = [
  'Students pursuing psychology, social work, or related fields',
  'Mental health advocates and wellness enthusiasts',
  'Content creators passionate about positive impact',
  'Healthcare professionals looking to contribute',
  'Anyone who believes in destigmatising mental health',
]

export default function AmbassadorPage() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: NAVBAR_HEIGHT }}>
      {/* Hero — indigo, different from academy's green */}
      <div className="bg-[#385246] text-white px-4 py-14">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <p className="text-xs font-bold tracking-widest uppercase text-white/50">Join Our Movement</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Become a PMC Ambassador
          </h1>
          <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed">
            Be a voice for mental wellness. Help build a healthier, happier community — one conversation at a time.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Benefits cards */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Why Become an Ambassador?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div
                  key={benefit.title}
                  className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="size-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Icon className="size-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{benefit.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Who can apply */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Who Can Apply?</h2>
          <ul className="space-y-3">
            {WHO_CAN_APPLY.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                <span className="text-gray-600 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* For more info — bottom CTA */}
        <div className="text-center space-y-4 pb-4">
          {/* <p className="text-gray-500 text-sm">
            For more information visit our website.
          </p> */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* <Link
              href="/contact-us"
              className="inline-flex items-center justify-center gap-2 bg-indigo-700 text-white font-semibold px-7 py-3 rounded-full hover:bg-indigo-800 transition-all text-sm"
            >
              <ArrowRight className="size-4" />
            </Link> */}
            <Link
              href="https://ambassador.positivemindcare.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold px-7 py-3 rounded-full hover:bg-gray-100 transition-all text-sm"
            >
              For More Info — Visit our Website
              <ExternalLink className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
