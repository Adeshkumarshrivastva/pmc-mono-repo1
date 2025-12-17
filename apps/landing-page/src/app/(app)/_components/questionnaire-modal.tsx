'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { match, P } from 'ts-pattern'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { answerValidationMap, type Question, questionnaire } from '@/lib/questionnaire'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type QuestionnaireModalProps = {
  trigger: React.ReactNode
}
export default function QuestionnaireModal({ trigger }: QuestionnaireModalProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const activeQuestion = questionnaire[activeQuestionIndex]
  const isLastQuestion = activeQuestionIndex === questionnaire.length - 1

  const handleChange = (id: string, value: unknown) => {
    setError(null)
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleNext = () => {
    const answerValidation = answerValidationMap[activeQuestion.type]
    const parsedAnswer = answerValidation.safeParse(answers[activeQuestion.id])

    if (parsedAnswer.error) {
      setError(activeQuestion.errorMessage)
      return
    } else if (error) {
      setError(null)
    }

    if (isLastQuestion) {
      router.push(`portal/experts`)
    } else {
      setActiveQuestionIndex((current) => current + 1)
    }
  }

  const handlePrevious = () => {
    if (error) {
      setError(null)
    }
    setActiveQuestionIndex((current) => current - 1)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-primary-foreground sm:max-w-screen sm:w-[calc(100%-2rem)] h-[calc(100%-2rem)] p-0 flex flex-col">
        <DialogTitle />
        <div className="p-6 sm:py-16 sm:px-60 flex-1">
          <QuestionCard
            question={activeQuestion}
            questionIndex={activeQuestionIndex}
            value={answers[activeQuestion.id]}
            error={error}
            onChange={(val) => {
              handleChange(activeQuestion.id, val)
            }}
          />
          <Button size="sm" onClick={handleNext} className="mt-4">
            {isLastQuestion ? 'See Result' : 'Next'}
          </Button>
        </div>

        <DialogFooter className="w-full p-0 m-0 h-auto">
          <div className="w-full flex space-x-2 items-center justify-between p-4 shadow-2xl">
            <Button
              size="sm"
              onClick={handlePrevious}
              disabled={activeQuestionIndex <= 0}
              variant="outline"
              className="hidden md:block text-primary hover:bg-primary-foreground hover:border-border"
            >
              Previous
            </Button>

            <Button
              size="icon"
              onClick={handlePrevious}
              disabled={activeQuestionIndex <= 0}
              variant="outline"
              className="md:hidden border-none text-primary hover:bg-primary-foreground hover:border-border"
              icon={<ArrowLeft />}
            />

            <div className="max-w-lg w-full">
              <div className="border border-border rounded-full bg-accent/20 h-4 relative mx-auto">
                <div
                  className="absolute h-full bg-primary rounded-full transition-width duration-300"
                  style={{
                    width: `${(activeQuestionIndex / questionnaire.length) * 100}%`,
                  }}
                />
              </div>
              <div className="hidden md:block text-xs mx-auto text-muted-foreground mt-1">
                {activeQuestionIndex} of {questionnaire.length} answered
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleNext}
              variant="outline"
              className="hidden md:block text-primary hover:bg-primary-foreground hover:border-border"
            >
              {isLastQuestion ? 'See Result' : 'Next'}
            </Button>

            <Button
              size="icon"
              onClick={handleNext}
              variant="outline"
              className="md:hidden border-none text-primary hover:bg-primary-foreground hover:border-border"
              icon={<ArrowRight />}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuestionCard({
  question,
  questionIndex,
  value,
  onChange,
  error,
}: {
  question: Question
  questionIndex: number
  value: unknown
  onChange: (value: unknown) => void
  error: string | null
}) {
  return (
    <>
      <h3 className="text-2xl font-medium">
        {questionIndex + 1}. {question.title}
      </h3>
      {error ? <div className="text-sm text-error mt-8">{error}</div> : null}
      <div className="space-y-4 mt-8">
        {match(question.type)
          .returnType<React.ReactNode>()
          .with('multiSelect', () =>
            question.options.map((opts) => {
              const isChecked = (value as string[])?.includes(opts.value)

              return (
                <Label
                  key={opts.value}
                  className={cn(
                    'flex items-center border border-primary/50 rounded-sm p-2.5',
                    isChecked ? 'text-primary border-primary bg-primary/10' : null,
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const arr = (value as string[]) ?? []
                      if (checked) {
                        onChange([...arr, opts.value])
                      } else {
                        onChange(arr.filter((v) => v !== opts.value))
                      }
                    }}
                  />
                  {opts.label}
                </Label>
              )
            }),
          )
          .with('singleSelect', () => (
            <RadioGroup
              value={value as string}
              onValueChange={(val) => {
                onChange(val)
              }}
            >
              {question.options.map((opts) => (
                <Label
                  key={opts.value}
                  className={cn(
                    'flex items-center border border-primary/50 rounded-sm p-2.5',
                    opts.value === value ? 'text-primary border-primary bg-primary/10' : null,
                  )}
                >
                  <RadioGroupItem value={opts.value} />
                  {opts.label}
                </Label>
              ))}
            </RadioGroup>
          ))
          .with(P._, () => null)
          .exhaustive()}
      </div>
    </>
  )
}
