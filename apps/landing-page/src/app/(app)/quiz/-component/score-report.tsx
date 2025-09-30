'use client'

import { Info, AlertTriangle, ArrowLeft, Calendar, UsersIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ScoreCategory = {
  level: string
  range: string
  color: string
  bgColor: string
  description: string
  recommendations: string[]
}

type ScoreReportProps = {
  score: number
  maxScore: number
  currentCategory: ScoreCategory
  scoreCategories: ScoreCategory[]
  title?: string
  reportTitle: string
  timestamp: string
  onBack: () => void
  onRetake: () => void
  onViewExperts?: () => void
  appointmentFormTrigger?: React.ReactNode
  additionalContent?: React.ReactNode
  disclaimer?: string
}

export default function ScoreReport({
  score,
  maxScore,
  currentCategory,
  scoreCategories,
  title = 'Understanding Your Score',
  reportTitle,
  timestamp,
  onBack,
  onRetake,
  onViewExperts,
  appointmentFormTrigger,
  additionalContent,
  disclaimer = "This assessment is not a diagnostic tool and should not replace professional medical advice. If you're experiencing persistent symptoms, please consult with a qualified mental health professional for proper evaluation and treatment.",
}: ScoreReportProps) {
  const percentage = (score / maxScore) * 100

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div className="mb-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-4 flex items-center gap-2 text-primary text-sm"
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Assessment
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{reportTitle}</h1>
            <p className="text-muted-foreground">Completed on {formatDate(timestamp)}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {onViewExperts && (
              <Button
                variant="default"
                className="flex items-center gap-2 w-full sm:w-auto"
                icon={<UsersIcon className="size-4" />}
                onClick={onViewExperts}
              >
                View Our Experts
              </Button>
            )}

            {appointmentFormTrigger}
          </div>
        </div>
      </div>

      <div className={`mb-6 rounded-2xl border-2 overflow-hidden shadow-xl ${currentCategory.bgColor}`}>
        <div className="bg-white/60 backdrop-blur-sm p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-3 mb-4">
              <div className="text-6xl font-bold text-gray-900">{score}</div>
              <div className="text-lg text-gray-600 mb-2">out of {maxScore}</div>
            </div>

            <div className="flex justify-center mb-4">
              <span
                className={`inline-flex items-center gap-2 text-xl px-6 py-2.5 rounded-full font-semibold ${currentCategory.color} bg-white border-2 border-current shadow-lg`}
              >
                {currentCategory.level}
              </span>
            </div>

            <p className="text-sm text-gray-600 font-medium">Score range: {currentCategory.range}</p>
          </div>

          <div className="mb-6">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
              <span>0</span>
              <span>{Math.floor(maxScore * 0.25)}</span>
              <span>{Math.floor(maxScore * 0.5)}</span>
              <span>{Math.floor(maxScore * 0.75)}</span>
              <span>{maxScore}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-gray-900 leading-relaxed">{currentCategory.description}</p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scoreCategories.map((category, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border-2 transition-all',
                  category.level === currentCategory.level
                    ? `${category.bgColor} border-current`
                    : 'bg-background border-border',
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      category.level === currentCategory.level ? 'bg-current opacity-100' : 'bg-muted-foreground/30',
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium',
                      category.level === currentCategory.level ? category.color : 'text-foreground',
                    )}
                  >
                    {category.level}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{category.range} points</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentCategory.level !== 'Normal' && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 leading-relaxed">{disclaimer}</p>
          </CardContent>
        </Card>
      )}

      {additionalContent}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRetake} variant="default" className="px-8">
          Retake Assessment
        </Button>

        <Button
          onClick={() => {
            window.print()
          }}
          variant="default"
          className="px-8"
        >
          Save Report
        </Button>
      </div>
    </>
  )
}
