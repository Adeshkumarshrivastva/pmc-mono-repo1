'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
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

const MAX_SCORE = 40

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

  return (
    <div className="min-h-screen bg-primary-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ScoreReport
          score={reportData.totalScore}
          maxScore={MAX_SCORE}
          currentCategory={currentCategory}
          scoreCategories={scoreCategories}
          reportTitle="Your AUDIT Assessment Report"
          timestamp={reportData.timestamp}
          onBack={() => {
            router.back()
          }}
          onRetake={() => {
            router.push('/quiz')
          }}
          disclaimer="This assessment is a screening tool and not a diagnostic instrument. It should not replace professional medical advice. If you're concerned about your drinking habits, please consult with a qualified healthcare professional or addiction specialist for proper evaluation and support."
        />

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
