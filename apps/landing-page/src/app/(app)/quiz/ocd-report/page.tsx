'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, AlertTriangle, CheckCircle, Info, Phone, MessageCircle } from 'lucide-react'
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
    level: 'Minimal OCD Symptoms',
    range: '0-20',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description:
      'Your responses indicate minimal OCD symptoms. You appear to be managing well with few obsessive or compulsive behaviors.',
    recommendations: [
      'Continue maintaining healthy daily routines',
      'Practice stress management techniques',
      'Stay aware of any changes in your thoughts or behaviors',
      'Maintain good self-care habits',
    ],
  },
  {
    level: 'Mild OCD Symptoms',
    range: '21-40',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    description: 'Your responses suggest mild OCD symptoms that may occasionally interfere with your daily life.',
    recommendations: [
      'Consider learning about OCD and its management strategies',
      'Practice mindfulness and relaxation techniques',
      'Try to gradually reduce checking or repetitive behaviors',
      'Consider speaking with a mental health professional',
    ],
  },
  {
    level: 'Moderate OCD Symptoms',
    range: '41-60',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description:
      'Your responses indicate moderate OCD symptoms that likely impact your daily functioning and well-being.',
    recommendations: [
      'Seek professional help from a mental health provider experienced in OCD',
      'Consider Cognitive Behavioral Therapy (CBT) or Exposure and Response Prevention (ERP)',
      'Learn about OCD management techniques and coping strategies',
      'Connect with OCD support groups or resources',
    ],
  },
  {
    level: 'Severe OCD Symptoms',
    range: '61-72',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description:
      'Your responses suggest severe OCD symptoms that significantly impact your daily life and functioning.',
    recommendations: [
      'Seek immediate professional help from an OCD specialist',
      'Consider intensive treatment options like specialized OCD therapy programs',
      'Discuss medication options with a psychiatrist familiar with OCD',
      'Engage family and friends in your treatment and recovery process',
    ],
  },
]

export default function OCDReportPage() {
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

          <h1 className="text-3xl font-bold text-foreground mb-2">Your OCD Assessment Report</h1>
          <p className="text-muted-foreground">Completed on {formatDate(reportData.timestamp)}</p>
        </div>

        <Card className={cn('mb-6 border-2', currentCategory.bgColor)}>
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="text-4xl font-bold text-foreground">{reportData.totalScore}</div>
              <div className="text-sm text-muted-foreground">out of 72</div>
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

        {currentCategory.level !== 'Minimal OCD Symptoms' && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                Important Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800 leading-relaxed">
                This assessment is not a diagnostic tool and should not replace professional medical advice. If
                you&apos;re experiencing persistent OCD symptoms, please consult with a qualified mental health
                professional who specializes in OCD for proper evaluation and treatment.
              </p>
            </CardContent>
          </Card>
        )}

        {(currentCategory.level === 'Moderate OCD Symptoms' || currentCategory.level === 'Severe OCD Symptoms') && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Info className="w-5 h-5" />
                OCD-Specific Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-blue-800">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">International OCD Foundation</p>
                    <p className="text-sm">Visit iocdf.org for resources and specialist directory</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">OCD Support Groups</p>
                    <p className="text-sm">Find local and online support groups through IOCDF</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Evidence-Based Treatment</p>
                    <p className="text-sm">
                      ERP (Exposure and Response Prevention) is the gold standard for OCD treatment
                    </p>
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
            This assessment is based on the Obsessive-Compulsive Inventory and is intended for educational purposes
            only. Results should be discussed with a healthcare professional who specializes in OCD for proper
            interpretation and treatment planning.
          </p>
        </div>
      </div>
    </div>
  )
}
