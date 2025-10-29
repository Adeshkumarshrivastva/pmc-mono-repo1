'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import AppointmentForm from '../../_components/appointment-form'
import ScoreReport from '../-component/score-report'

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
    level: 'Normal',
    range: '0-9',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Your responses indicate minimal signs of depression. You appear to be managing well emotionally.',
    recommendations: [
      'Continue maintaining healthy lifestyle habits',
      'Stay connected with friends and family',
      'Practice regular self-care activities',
      'Monitor your mental health regularly',
    ],
  },
  {
    level: 'Mild Depression',
    range: '10-18',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    description: 'Your responses suggest mild depressive symptoms that may be affecting your daily life.',
    recommendations: [
      'Consider talking to a healthcare professional',
      'Maintain regular exercise and healthy sleep patterns',
      'Practice stress management techniques',
      'Stay socially connected and engaged',
    ],
  },
  {
    level: 'Moderate Depression',
    range: '19-29',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Your responses indicate moderate depressive symptoms that likely impact your daily functioning.',
    recommendations: [
      'Seek professional help from a mental health provider',
      'Consider therapy or counseling services',
      'Discuss treatment options with your doctor',
      'Reach out to trusted friends or family for support',
    ],
  },
  {
    level: 'Severe Depression',
    range: '30-60',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Your responses suggest severe depressive symptoms that significantly impact your daily life.',
    recommendations: [
      'Seek immediate professional help',
      'Contact a mental health crisis line if needed',
      'Consider medication evaluation with a psychiatrist',
      'Engage family/friends in your support system',
    ],
  },
]

const MAX_SCORE = 60

export default function DepressionReportPage() {
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

  return (
    <div className="min-h-screen bg-primary-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ScoreReport
          score={reportData.totalScore}
          maxScore={MAX_SCORE}
          currentCategory={currentCategory}
          scoreCategories={scoreCategories}
          reportTitle="Your Depression Assessment Report"
          timestamp={reportData.timestamp}
          onBack={() => {
            router.back()
          }}
          onRetake={() => {
            router.push('/quiz')
          }}
          onViewExperts={() => {
            router.push('/portal/experts')
          }}
          appointmentFormTrigger={
            <AppointmentForm
              trigger={
                <Button
                  variant="default"
                  className="flex items-center gap-2 w-full sm:w-auto"
                  icon={<Calendar className="w-4 h-4" />}
                >
                  Book a Consultation
                </Button>
              }
            />
          }
        />
      </div>
    </div>
  )
}
