'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { QuestionCard } from '../-component/question-card'

const questions = [
  'I feel down hearted and blue.',
  'Morning is when i feel the best.',
  'I have crying spells often.',
  'I have trouble sleeping at night.',
  'I eat as much as I used to.',
  // 'I still enjoy sex.',
  // 'I noticed that I am loosing weight.',
  // 'I have trouble with constipation.',
  // 'My heart beats faster than usual.',
  // 'I get tired for no reason.',
  // 'My mind is as clear as it used to be.',
  // 'I find it easy to do the things I used to do.',
  // "I am restless and can't keep still.",
  // 'I feel hopeful about the future.',
  // 'I am more irritable than usual.',
  // 'I find it easy to make decisions.',
  // 'I feel that I am useful and needed.',
  // 'My life is pretty full.',
  // 'I feel that others would be better off if I were dead.',
  // 'I still enjoy the things I used to.',
]

const options = [
  { value: 'a', label: 'Not at all' },
  { value: 'b', label: 'A little' },
  { value: 'c', label: 'Moderately' },
  { value: 'd', label: 'A lot' },
]

export default function DepressionQuizPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(0)

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

  function handleSubmit() {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Depression Assessment Questionnaire</h1>
          <p className="text-muted-foreground">Please answer each question based on how youve been feeling recently.</p>
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
    </div>
  )
}
