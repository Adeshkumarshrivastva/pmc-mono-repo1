'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScoreReport from '../-component/score-report'
import AppointmentForm from '../../_components/appointment-form'

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

const MAX_SCORE = 72

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
            router.push('http://localhost:5173/portal/experts')
          }}
          disclaimer="This assessment is not a diagnostic tool and should not replace professional medical advice. If you're experiencing persistent OCD symptoms, please consult with a qualified mental health professional who specializes in OCD for proper evaluation and treatment."
          appointmentFormTrigger={
            <AppointmentForm
              trigger={
                <Button
                  variant="default"
                  className="flex items-center gap-2 w-full sm:w-auto"
                  icon={<CalendarIcon className="w-4 h-4" />}
                >
                  Book a Consultation
                </Button>
              }
            />
          }
        />

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
