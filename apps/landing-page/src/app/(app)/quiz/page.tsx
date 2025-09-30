'use client'

import { Brain, Cloud, Repeat, Wine, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const NAVBAR_HEIGHT = 64

type Assessment = {
  id: string
  title: string
  icon: LucideIcon
  route: string
}

export default function QuizPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <AssessmentSection />
    </div>
  )
}

function AssessmentSection() {
  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14 md:py-20 lg:py-24">
        <div className="mb-10 text-center sm:mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl font-display">
            Free Mental Health Assessments
          </h2>
          <div className="mt-4 max-w-3xl mx-auto">
            <div className="h-1 w-24 bg-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-base sm:text-lg">
              Join our community and get access to exclusive content on mental wellness.
            </p>
            <p className="text-muted-foreground text-base sm:text-lg">Take a free test and get your report.</p>
          </div>
        </div>
        <AssessmentCards />
      </div>
    </section>
  )
}

function AssessmentCards() {
  const assessments: Assessment[] = [
    {
      id: 'anxiety',
      title: 'Anxiety',
      icon: Brain,
      route: '/quiz/anxiety-quiz',
    },
    {
      id: 'depression',
      title: 'Depression',
      icon: Cloud,
      route: '/quiz/depression-quiz',
    },
    {
      id: 'ocd',
      title: 'OCD',
      icon: Repeat,
      route: '/quiz/ocd-quiz',
    },
    {
      id: 'addiction',
      title: 'Addiction',
      icon: Wine,
      route: '/quiz/addiction-quiz',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {assessments.map(function (assessment) {
        return <AssessmentCard key={assessment.id} assessment={assessment} />
      })}
    </div>
  )
}

function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const IconComponent = assessment.icon

  return (
    <Link href={assessment.route} className="block">
      <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group overflow-hidden">
        <CardContent className="flex items-center justify-center min-h-[200px] relative">
          <AnimatedIcon icon={IconComponent} type={assessment.id} />
        </CardContent>
        <CardHeader>
          <CardTitle className="text-xl">{assessment.title}</CardTitle>
          <CardAction>
            <IconComponent className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
          </CardAction>
        </CardHeader>
      </Card>
    </Link>
  )
}

function AnimatedIcon({ icon: Icon, type }: { icon: any; type: string }) {
  const animations: Record<string, string> = {
    anxiety: 'animate-pulse',
    depression: 'animate-bounce',
    ocd: 'animate-spin',
    addiction: 'animate-pulse',
  }

  const animationDuration: Record<string, React.CSSProperties> = {
    anxiety: { animationDuration: '2s' },
    depression: { animationDuration: '2.5s' },
    ocd: { animationDuration: '3s' },
    addiction: { animationDuration: '2s' },
  }

  return (
    <div className="relative">
      <Icon className={cn('size-24 opacity-80', animations[type] || '')} style={animationDuration[type]} />
      {type === 'anxiety' && (
        <>
          <div
            className="absolute inset-0 rounded-full border-4 border-current opacity-20 animate-ping"
            style={{ animationDuration: '2s' }}
          ></div>
          <div
            className="absolute inset-2 rounded-full border-2 border-current opacity-30 animate-ping"
            style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
          ></div>
        </>
      )}
      {type === 'depression' && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
          {[...Array(5)].map(function (_, i) {
            return (
              <div
                key={i}
                className="w-0.5 h-6 bg-current opacity-40 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1.5s' }}
              ></div>
            )
          })}
        </div>
      )}
    </div>
  )
}
