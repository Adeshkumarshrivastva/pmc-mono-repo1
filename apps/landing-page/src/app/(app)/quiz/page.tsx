import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import config from '@payload-config'
import type { Quiz } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

const NAVBAR_HEIGHT = 64

export default async function QuizPage() {
  const payload = await getPayload({ config })

  const [{ docs: assessments }, pageContent] = await Promise.all([
    payload.find({
      collection: 'quiz',
      sort: 'order',
    }),
    payload.findGlobal({
      slug: 'quiz-page',
    }),
  ])

  return (
    <div className="flex flex-col min-h-screen bg-background" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <AssessmentSection assessments={assessments} pageContent={pageContent} />
    </div>
  )
}

type AssessmentSectionProps = {
  assessments: Quiz[]
  pageContent: {
    heading?: string | null
    subtitle1?: string | null
    subtitle2?: string | null
  }
}

function AssessmentSection({ assessments, pageContent }: AssessmentSectionProps) {
  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14 md:py-20 lg:py-24">
        <div className="mb-10 text-center sm:mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl font-display">
            {pageContent?.heading ?? ''}
          </h2>
          <div className="mt-4 max-w-3xl mx-auto">
            <div className="h-1 w-24 bg-primary mx-auto mb-4"></div>
            {pageContent.subtitle1 && (
              <p className="text-muted-foreground text-base sm:text-lg">{pageContent.subtitle1}</p>
            )}
            {pageContent.subtitle2 && (
              <p className="text-muted-foreground text-base sm:text-lg">{pageContent.subtitle2}</p>
            )}
          </div>
        </div>
        <AssessmentCards assessments={assessments} />
      </div>
    </section>
  )
}

type AssessmentCardsProps = {
  assessments: Quiz[]
}

function AssessmentCards({ assessments }: AssessmentCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {assessments.map((assessment) => (
        <AssessmentCard key={assessment.id} assessment={assessment} />
      ))}
    </div>
  )
}

interface AssessmentCardProps {
  assessment: Quiz
}

function AssessmentCard({ assessment }: AssessmentCardProps) {
  return (
    <Link href={assessment.slug} className="block">
      <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group overflow-hidden h-full flex flex-col">
        <CardContent className="flex items-center justify-center p-6 flex-1">
          {assessment.image ? (
            <div className="relative w-full h-58">
              <Image
                alt={assessment.title}
                fill
                className="object-cover rounded-md"
                src={getURLFromMedia(assessment.image ?? '')}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ) : null}
        </CardContent>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{assessment.title}</CardTitle>
          <CardAction></CardAction>
        </CardHeader>
      </Card>
    </Link>
  )
}
