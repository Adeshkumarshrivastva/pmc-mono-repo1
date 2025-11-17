'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, AlertTriangle, CheckCircle, Info, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ReportData = {
  answers: Record<string, string>
  totalScore: number
  timestamp: string
}

type ScoreCategory = {
  level: string
  range: string
  color: string
  bgColor: string
  description: string
  recommendations: string[]
}

const scoreCategories: ScoreCategory[] = [
  {
    level: 'Low Risk',
    range: '0-7',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description:
      'Your alcohol consumption appears to be within low-risk guidelines. You demonstrate responsible drinking habits.',
    recommendations: [
      'Continue to drink responsibly and within recommended limits',
      'Be aware of situations that might lead to increased drinking',
      'Stay informed about safe drinking guidelines',
      'Maintain healthy lifestyle choices',
    ],
  },
  {
    level: 'Increasing Risk',
    range: '8-15',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    description:
      'Your drinking pattern suggests an increasing level of risk. You may be drinking more than is advisable for your health.',
    recommendations: [
      'Consider reducing your alcohol intake',
      'Set limits on how much and how often you drink',
      'Seek advice from a healthcare professional',
      'Identify triggers that lead to increased drinking',
    ],
  },
  {
    level: 'Higher Risk',
    range: '16-19',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description:
      'Your responses indicate a higher risk drinking pattern that may be causing harm to your health and wellbeing.',
    recommendations: [
      'Seek professional advice from a healthcare provider',
      'Consider counseling or brief intervention programs',
      'Evaluate the impact of alcohol on your daily life',
      'Reach out to support groups or alcohol services',
    ],
  },
  {
    level: 'Possible Dependence',
    range: '20-40',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description:
      'Your responses suggest possible alcohol dependence. Your drinking pattern may require specialized assessment and support.',
    recommendations: [
      'Seek immediate professional help from an addiction specialist',
      'Consider comprehensive assessment for alcohol dependence',
      'Explore treatment options including therapy and support groups',
      'Involve family and friends in your recovery journey',
    ],
  },
]

export default function AlcoholReportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [currentCategory, setCurrentCategory] = useState<ScoreCategory | null>(null)

  useEffect(() => {
    const scoreParam = searchParams.get('score')
    const dataParam = searchParams.get('data')

    if (scoreParam && dataParam) {
      try {
        const decodedData = JSON.parse(atob(dataParam))
        setReportData(decodedData)

        const score = parseInt(scoreParam)
        const category = scoreCategories.find((cat) => {
          const [min, max] = cat.range.split('-').map(Number)
          return score >= min && score <= max
        })
        setCurrentCategory(category || null)
      } catch (error) {
        console.error('Error parsing report data:', error)
      }
    }
  }, [searchParams])

  if (!reportData || !currentCategory) {
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="default"
            className="mb-4 flex items-center gap-2"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Assessment
          </Button>

          <h1 className="text-3xl font-bold text-foreground mb-2">Your AUDIT Assessment Report</h1>
          <p className="text-muted-foreground">Completed on {formatDate(reportData.timestamp)}</p>
        </div>

        <Card className={cn('mb-6 border-2', currentCategory.bgColor)}>
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="text-4xl font-bold text-foreground">{reportData.totalScore}</div>
              <div className="text-sm text-muted-foreground">out of 40</div>
            </div>

            <Badge variant="secondary" className={cn('text-lg px-4 py-2', currentCategory.color, 'bg-background')}>
              {currentCategory.level}
            </Badge>

            <p className="text-sm text-muted-foreground mt-2">Score range: {currentCategory.range}</p>
          </CardHeader>

          <CardContent>
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">{currentCategory.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Understanding Your Score
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentCategory.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-foreground">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {currentCategory.level !== 'Low Risk' && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                Important Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800 leading-relaxed">
                This assessment is a screening tool and not a diagnostic instrument. It should not replace professional
                medical advice. If you&apos;re concerned about your drinking habits, please consult with a qualified
                healthcare professional or addiction specialist for proper evaluation and support.
              </p>
            </CardContent>
          </Card>
        )}

        {(currentCategory.level === 'Higher Risk' || currentCategory.level === 'Possible Dependence') && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Phone className="w-5 h-5" />
                Support Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-red-800">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">SAMHSA National Helpline</p>
                    <p className="text-sm">1-800-662-4357 - Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Alcoholics Anonymous</p>
                    <p className="text-sm">Visit www.aa.org to find local meetings</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">SMART Recovery</p>
                    <p className="text-sm">Alternative support program - visit smartrecovery.org</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => router.push('/quiz')} variant="default" className="px-8">
            Retake Assessment
          </Button>

          <Button onClick={() => window.print()} variant="default" className="px-8">
            Save Report
          </Button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            This assessment is based on the AUDIT (Alcohol Use Disorders Identification Test) developed by the World
            Health Organization and is intended for screening purposes only. Results should be discussed with a
            healthcare professional for proper interpretation and treatment planning.
          </p>
        </div>
      </div>
    </div>
  )
}
