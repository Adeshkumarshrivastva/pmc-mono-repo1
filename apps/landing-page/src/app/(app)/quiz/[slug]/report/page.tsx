'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { ArrowLeft, AlertTriangle, CheckCircle, Info, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MatchedExperts from './matched-experts'

type ReportData = {
  answers: Record<string, string>
  totalScore: number
  timestamp: string
  quizTitle: string
  riskLevels: RiskLevel[]
}

type RiskLevel = {
  level: string
  minScore: number
  maxScore: number
  color: string
  bgColor: string
  description: string
  recommendations: { text: string }[]
}

export default function QuizReportPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [currentLevel, setCurrentLevel] = useState<RiskLevel | null>(null)

  useEffect(() => {
    const scoreParam = searchParams.get('score')
    const dataParam = searchParams.get('data')

    if (scoreParam && dataParam) {
      try {
        const decodedData = JSON.parse(atob(dataParam))
        setReportData(decodedData)

        const score = parseInt(scoreParam)
        const riskLevels = decodedData.riskLevels || []
        const matchedLevel = riskLevels.find((level: RiskLevel) => score >= level.minScore && score <= level.maxScore)
        setCurrentLevel(matchedLevel || null)
      } catch (error) {
        console.error('Error parsing report data:', error)
      }
    }
  }, [searchParams])

  if (!reportData || !currentLevel) {
    return (
      <div className="min-h-screen bg-primary-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your report...</p>
        </div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-primary-foreground">
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Button
            onClick={() => {
              router.push('/quiz')
            }}
            variant="default"
            className="mb-4 flex items-center gap-2"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Assessment
          </Button>

          <h1 className="text-3xl font-bold text-foreground mb-2">{reportData.quizTitle} - Assessment Report</h1>
          <p className="text-muted-foreground">Completed on {formatDate(reportData.timestamp)}</p>
        </div>

        <Card className={cn('mb-6 border-2', currentLevel.bgColor)}>
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="text-4xl font-bold text-foreground">{reportData.totalScore}</div>
              <div className="text-sm text-muted-foreground">
                out of {reportData.riskLevels.reduce((max, level) => Math.max(max, level.maxScore), 0)}
              </div>
            </div>

            <Badge variant="secondary" className={cn('text-xl px-4 py-2 mx-auto', currentLevel.color, 'bg-background')}>
              {currentLevel.level}
            </Badge>

            <p className="text-sm text-muted-foreground mt-2">
              Score range: {currentLevel.minScore}-{currentLevel.maxScore}
            </p>
          </CardHeader>

          <CardContent>
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">{currentLevel.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 text-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Understanding Your Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.riskLevels.map((level, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border-2 transition-all',
                    level.level === currentLevel.level
                      ? `${level.bgColor} border-current`
                      : 'bg-background border-border',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        level.level === currentLevel.level ? 'bg-current opacity-100' : 'bg-muted-foreground/30',
                      )}
                    />
                    <span
                      className={cn(
                        'font-medium',
                        level.level === currentLevel.level ? level.color : 'text-foreground',
                      )}
                    >
                      {level.level}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {level.minScore}-{level.maxScore} points
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 text-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentLevel.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-foreground">{recommendation.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {currentLevel.level !== reportData.riskLevels[0]?.level && (
          <Card className="mb-6 border-amber-200 bg-amber-50 text-lg  ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                Important Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800 leading-relaxed">
                This assessment is a screening tool and not a diagnostic instrument. It should not replace professional
                medical advice. If you&apos;re concerned about your mental health, please consult with a qualified
                healthcare professional for proper evaluation and support.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              router.push(`/quiz/${params.slug}`)
            }}
            variant="default"
            className="px-8 text-lg"
          >
            Retake Assessment
          </Button>

          <Button
            onClick={() => {
              window.print()
            }}
            variant="default"
            className="px-8 text-lg"
          >
            Save Report
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            This assessment is intended for screening purposes only. Results should be discussed with a healthcare
            professional for proper interpretation and treatment planning.
          </p>
        </div>

        <MatchedExperts quizTitle={reportData.quizTitle} />
      </div>
    </div>
  )
}
