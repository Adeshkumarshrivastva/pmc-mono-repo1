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
    level: 'Minimal Anxiety',
    range: '0-9',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Your responses indicate minimal signs of anxiety. You appear to be managing stress well.',
    recommendations: [
      'Continue practicing healthy stress management techniques',
      'Maintain regular physical activity and good sleep habits',
      'Stay connected with your support network',
      'Keep monitoring your mental wellbeing',
    ],
  },
  {
    level: 'Mild Anxiety',
    range: '10-20',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    description: 'Your responses suggest mild anxiety symptoms that may occasionally affect your daily activities.',
    recommendations: [
      'Practice relaxation techniques like deep breathing or meditation',
      'Consider talking to a healthcare professional if symptoms persist',
      'Maintain a regular exercise routine to reduce stress',
      'Limit caffeine and alcohol intake',
      'Ensure adequate sleep and rest',
    ],
  },
  {
    level: 'Moderate Anxiety',
    range: '21-40',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description:
      'Your responses indicate moderate anxiety symptoms that likely impact your daily functioning and quality of life.',
    recommendations: [
      'Seek professional help from a mental health provider',
      'Consider cognitive behavioral therapy (CBT) or other evidence-based treatments',
      'Discuss anxiety management strategies with your doctor',
      'Practice mindfulness and stress reduction techniques regularly',
      'Build a strong support system with friends and family',
    ],
  },
  {
    level: 'Severe Anxiety',
    range: '41-60',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description:
      'Your responses suggest severe anxiety symptoms that significantly interfere with your daily life and wellbeing.',
    recommendations: [
      'Seek immediate professional help from a mental health specialist',
      'Contact a mental health crisis line if you feel overwhelmed',
      'Consider medication evaluation with a psychiatrist',
      'Engage in intensive therapy or counseling',
      'Inform trusted family members or friends about your struggles',
      'Avoid self-medication with alcohol or substances',
    ],
  },
]

const MAX_SCORE = 60

export default function AnxietyReportPage() {
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
          reportTitle="Your Anxiety Assessment Report"
          timestamp={reportData.timestamp}
          onBack={() => {
            router.back()
          }}
          onRetake={() => {
            router.push('/quiz/anxiety')
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
