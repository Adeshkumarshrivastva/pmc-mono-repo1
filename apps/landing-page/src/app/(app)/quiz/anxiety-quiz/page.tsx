'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { QuestionCard } from '../-component/question-card'
import QuizContactForm from '../-component/contact-form'

const questions = [
  'I experience excessive worry about everyday situations.',
  'I find it difficult to control my worrying thoughts.',
  // 'I feel restless or on edge most of the time.',
  // 'I get easily fatigued even with minimal activity.',
  // 'I have difficulty concentrating or my mind goes blank.',
  // 'I experience muscle tension or soreness.',
  // 'I have trouble falling or staying asleep.',
  // 'I avoid social situations due to anxiety.',
  // 'I experience sudden episodes of intense fear or discomfort.',
  // 'I worry about having panic attacks in public places.',
  // 'I feel my worries are interfering with my daily life.',
  // 'I experience physical symptoms like sweating or trembling when anxious.',
  // 'I have persistent fears about specific objects or situations.',
  // 'I replay conversations or events repeatedly in my mind.',
  // 'I feel overwhelmed by my responsibilities.',
  // 'I have difficulty relaxing even when I try.',
  // 'I experience chest tightness or difficulty breathing when stressed.',
  // 'I worry excessively about my health or the health of loved ones.',
  // 'I feel irritable or easily frustrated.',
  // 'I avoid activities or places that might trigger anxiety.',
]

const options = [
  { value: 'a', label: 'Not at all' },
  { value: 'b', label: 'Several days' },
  { value: 'c', label: 'More than half the days' },
  { value: 'd', label: 'Nearly every day' },
]

export default function AnxietyQuizPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [showContactDialog, setShowContactDialog] = useState(false)

  const questionsPerPage = 1
  const totalPages = Math.ceil(questions.length / questionsPerPage)
  const startIndex = currentPage * questionsPerPage
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage)

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [startIndex + questionIndex]: value,
    }))
  }

  function calculateScore() {
    const scoreMap = { a: 0, b: 1, c: 2, d: 3 }
    let totalScore = 0

    Object.values(answers).forEach((answer) => {
      totalScore += scoreMap[answer as keyof typeof scoreMap] || 0
    })

    return totalScore
  }

  function navigateToResults() {
    const score = calculateScore()
    const resultsData = {
      answers,
      totalScore: score,
      timestamp: new Date().toISOString(),
    }

    const searchParams = new URLSearchParams({
      score: score.toString(),
      data: btoa(JSON.stringify(resultsData)),
    })

    router.push(`/quiz/depression-report?${searchParams.toString()}`)
  }

  function handleSubmit() {
    setShowContactDialog(true)
  }

  function getAnsweredCount() {
    return Object.keys(answers).length
  }

  function isQuestionAnswered(questionIndex: number) {
    return answers[startIndex + questionIndex] !== undefined
  }

  return (
    <div className="min-h-screen bg-primary-foreground ">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Anxiety Assessment Questionnaire</h1>
          <p className="text-muted-foreground">
            Please answer each question based on how you&apos;ve been feeling over the past two weeks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          {currentQuestions.map((question, index) => (
            <QuestionCard
              key={startIndex + index}
              questionNumber={startIndex + index + 1}
              question={question}
              value={answers[startIndex + index]}
              onChange={(value) => handleAnswerChange(index, value)}
              isAnswered={isQuestionAnswered(index)}
              options={options}
            />
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={() => {
                if (currentPage > 0) {
                  setCurrentPage((prev) => prev - 1)
                }
              }}
              disabled={currentPage === 0}
              variant="default"
              className="flex items-center gap-2"
              icon={<ArrowLeft className="size-4" />}
            >
              Previous
            </Button>

            <Button
              onClick={() => {
                if (currentPage < totalPages - 1) {
                  setCurrentPage((prev) => prev + 1)
                }
              }}
              disabled={currentPage === totalPages - 1}
              variant="default"
              className="flex items-center gap-2"
              icon={<ArrowRight className="size-4" />}
            >
              Next
            </Button>
          </div>

          <div className="relative">
            <div className="border border-border rounded-full bg-accent/20 h-4 relative">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                style={{
                  width: `${(getAnsweredCount() / questions.length) * 100}%`,
                }}
              />
            </div>
            <div className="text-sm text-center text-muted-foreground mt-2">
              {getAnsweredCount()} of {questions.length} questions answered
            </div>
          </div>
        </div>
        {currentPage === totalPages - 1 && (
          <div className="mt-6 text-center">
            <Button disabled={getAnsweredCount() < questions.length} onClick={handleSubmit} className="px-8 size-lg">
              Submit Assessment
            </Button>
            {getAnsweredCount() < questions.length && (
              <p className="text-sm text-muted-foreground mt-2">Please answer all questions before submitting</p>
            )}
          </div>
        )}
      </div>

      <QuizContactForm
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        onSuccess={navigateToResults}
        title="Get Your Depression Assessment Results"
        description="Enter your details to view your personalized depression assessment report"
      />
    </div>
  )
}
