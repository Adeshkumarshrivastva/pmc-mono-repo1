'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import anxietyImg from '@/app/assets/anxiety.jpg'
import depressionImg from '@/app/assets/depression.jpg'
import ocdImg from '@/app/assets/ocd.jpg'
import addictionImg from '@/app/assets/adiction.jpg'

const NAVBAR_HEIGHT = 64

type Assessment = {
  id: string
  title: string
  image: any
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
      image: anxietyImg,
      route: '/quiz/anxiety-quiz',
    },
    {
      id: 'depression',
      title: 'Depression',
      image: depressionImg,
      route: '/quiz/depression-quiz',
    },
    {
      id: 'ocd',
      title: 'OCD',
      image: ocdImg,
      route: '/quiz/ocd-quiz',
    },
    {
      id: 'addiction',
      title: 'Addiction',
      image: addictionImg,
      route: '/quiz/addiction-quiz',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {assessments.map((assessment) => (
        <AssessmentCard key={assessment.id} assessment={assessment} />
      ))}
    </div>
  )
}

function AssessmentCard({ assessment }: { assessment: Assessment }) {
  return (
    <Link href={assessment.route} className="block">
      <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group overflow-hidden">
        <CardContent className="flex items-center justify-center min-h-[200px] p-6">
          <div className="relative w-65 h-65">
            <Image src={assessment.image} alt={assessment.title} fill className="object-cover" />
          </div>
        </CardContent>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{assessment.title}</CardTitle>
          <CardAction></CardAction>
        </CardHeader>
      </Card>
    </Link>
  )
}
