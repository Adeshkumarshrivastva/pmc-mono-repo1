import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@payload-config'

import type { Quiz } from '@/payload/types'
import QuizRender from '../-component/quiz'

type QuizPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'quiz',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  })

  const quiz = docs[0] as Quiz | undefined

  if (!quiz || !quiz.questionnaire || quiz.questionnaire.length === 0) {
    notFound()
  }

  return <QuizRender quiz={quiz} />
}

export async function generateMetadata({ params }: QuizPageProps) {
  const { slug } = await params

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'quiz',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  const quiz = docs[0] as Quiz | undefined

  if (!quiz) {
    return {
      title: 'Quiz Not Found',
    }
  }

  return {
    title: `${quiz.title} | Mental Health Assessment`,
    description: quiz.description || `Take our ${quiz.title} to assess your mental health.`,
  }
}
