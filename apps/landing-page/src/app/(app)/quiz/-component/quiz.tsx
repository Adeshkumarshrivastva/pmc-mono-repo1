'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Quiz } from '@/payload/types'
import { QuestionCard } from './question-card'
import QuizContactForm from './contact-form'

type QuizProps = {
  quiz: Quiz
}

export default function QuizRender({ quiz }: QuizProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [showContactDialog, setShowContactDialog] = useState(false)

  const questions = quiz.questionnaire
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
      const question = questions[qIndex]
      if (question) {
        const option = question.options.find((opt) => opt.value === answerValue)
        if (option) {
          totalScore += option.score
        }
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
      quizTitle: quiz.title,
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
    <div className="min-h-screen bg-primary-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{quiz.title}</h1>
          {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          {currentQuestions.map((questionData, index) => (
            <QuestionCard
              key={startIndex + index}
              questionNumber={startIndex + index + 1}
              question={questionData.question}
              value={answers[startIndex + index]}
              onChange={(value) => handleAnswerChange(index, value)}
              isAnswered={isQuestionAnswered(index)}
              options={questionData.options}
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
              Generate Report
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
        title={'Get Your Assessment Results'}
        description={'Enter your details to view your personalized assessment report'}
      />
    </div>
  )
}
