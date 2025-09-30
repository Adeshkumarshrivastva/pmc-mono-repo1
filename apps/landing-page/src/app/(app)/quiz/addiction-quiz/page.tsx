'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { QuestionCard } from '../-component/question-card'
import QuizContactForm from '../-component/contact-form'

type Option = {
  value: string
  label: string
  score: number
}

const questions: string[] = [
  'How often do you have a drink containing alcohol?',
  'How many drinks containing alcohol do you have on a typical day when you are drinking?',
  'How often do you have six or more drinks on one occasion?',
  'How often during the last year have you found that you were not able to stop drinking once you had started?',
  'How often during the last year you failed to do what was normally expected of you because of drinking?',
  'How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?',
  'How often during the last year have you had a feeling of guilt or remorse after drinking?',
  'How often during the last year have you been unable to remember what happened the night before because of your drinking?',
  'Have you or someone else been injured because of your drinking?',
  'Has a relative, friend, doctor, or other healthcare worker been concerned about your drinking or suggested that you cut down?',
]

const optionsByQuestion: Option[][] = [
  [
    { value: 'a', label: 'Never', score: 0 },
    { value: 'b', label: 'Monthly or less', score: 1 },
    { value: 'c', label: '2-4 times a month', score: 2 },
    { value: 'd', label: '2-3 times a week', score: 3 },
    { value: 'e', label: '4 or more times a week', score: 4 },
  ],
  [
    { value: 'a', label: '1 or 2', score: 0 },
    { value: 'b', label: '3 or 4', score: 1 },
    { value: 'c', label: '5 or 6', score: 2 },
    { value: 'd', label: '7 or 9', score: 3 },
    { value: 'e', label: '10 or more', score: 4 },
  ],
  [
    { value: 'a', label: 'Never', score: 0 },
    { value: 'b', label: 'Less than monthly', score: 1 },
    { value: 'c', label: 'Monthly', score: 2 },
    { value: 'd', label: 'Weekly', score: 3 },
    { value: 'e', label: 'Daily or almost Daily', score: 4 },
  ],
  [
    { value: 'a', label: 'Never', score: 0 },
    { value: 'b', label: 'Less than monthly', score: 1 },
    { value: 'c', label: 'Monthly', score: 2 },
    { value: 'd', label: 'Weekly', score: 3 },
    { value: 'e', label: 'Daily or Almost Daily', score: 4 },
  ],
  [
    { value: 'a', label: 'Never', score: 0 },
    { value: 'b', label: 'Less than monthly', score: 1 },
    { value: 'c', label: 'Monthly', score: 2 },
    { value: 'd', label: 'Weekly', score: 3 },
    { value: 'e', label: 'Daily or Almost Daily', score: 4 },
  ],
  [
    { value: 'a', label: 'Never', score: 0 },
    { value: 'b', label: 'Less than monthly', score: 1 },
    { value: 'c', label: 'Monthly', score: 2 },
    { value: 'd', label: 'Weekly', score: 3 },
    { value: 'e', label: 'Daily or Almost Daily', score: 4 },
  ],
  [
    { value: 'a', label: 'Never', score: 0 },
    { value: 'b', label: 'Less than monthly', score: 1 },
    { value: 'c', label: 'Monthly', score: 2 },
    { value: 'd', label: 'Weekly', score: 3 },
    { value: 'e', label: 'Daily or Almost Daily', score: 4 },
  ],
  [
    { value: 'a', label: 'Never', score: 0 },
    { value: 'b', label: 'Less than monthly', score: 1 },
    { value: 'c', label: 'Monthly', score: 2 },
    { value: 'd', label: 'Weekly', score: 3 },
    { value: 'e', label: 'Daily or Almost Daily', score: 4 },
  ],
  [
    { value: 'a', label: 'No', score: 0 },
    { value: 'b', label: 'Yes, but not in the last year', score: 2 },
    { value: 'c', label: 'Yes, during the last year', score: 4 },
  ],
  [
    { value: 'a', label: 'No', score: 0 },
    { value: 'b', label: 'Yes, but not in the last year', score: 2 },
    { value: 'c', label: 'Yes, during the last year', score: 4 },
  ],
]

export default function AlcoholAuditQuiz() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [showContactDialog, setShowContactDialog] = useState(false)

  const questionsPerPage = 1
  const totalPages = Math.ceil(questions.length / questionsPerPage)
  const startIndex = currentPage * questionsPerPage
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage)

  function handleAnswerChange(questionIndex: number, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [startIndex + questionIndex]: value,
    }))
  }

  function calculateScore() {
    let totalScore = 0
    Object.entries(answers).forEach(([questionIndex, answerValue]) => {
      const qIndex = parseInt(questionIndex)
      const option = optionsByQuestion[qIndex]?.find((opt) => opt.value === answerValue)
      if (option) {
        totalScore += option.score
      }
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Alcohol Use Assessment (AUDIT)</h1>
          <p className="text-muted-foreground">
            Please answer each question based on your alcohol consumption patterns.
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
              options={optionsByQuestion[startIndex + index]}
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
