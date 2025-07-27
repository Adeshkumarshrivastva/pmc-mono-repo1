'use client'

import { useState } from 'react'
import { match, P } from 'ts-pattern'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Question, questionnaire } from '@/lib/questionnaire'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type QuestionnaireModalProps = {
  trigger: React.ReactNode
}
export default function QuestionnaireModal({ trigger }: QuestionnaireModalProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const activeQuestion = questionnaire[activeQuestionIndex]

  const handleChange = (id: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleNext = () => {
    setActiveQuestionIndex((current) => current + 1)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-primary-foreground sm:max-w-screen sm:w-[calc(100%-2rem)] h-[calc(100%-2rem)] sm:py-16 sm:px-60">
        <QuestionCard
          question={activeQuestion}
          questionIndex={activeQuestionIndex}
          value={answers[activeQuestion.id]}
          onChange={(val) => {
            handleChange(activeQuestion.id, val)
          }}
          onNext={handleNext}
        />
      </DialogContent>
    </Dialog>
  )
}

function QuestionCard({
  question,
  questionIndex,
  value,
  onChange,
  onNext,
}: {
  question: Question
  questionIndex: number
  value: unknown
  onChange: (value: unknown) => void
  onNext: () => void
}) {
  return (
    <div>
      <h3 className="text-2xl font-medium">
        {questionIndex + 1}. {question.title}
      </h3>
      <div className="mt-8 space-y-4">
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
          .with('singleSelect', () => <div>Options here</div>)
          .with(P._, () => null)
          .exhaustive()}
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  )
}
