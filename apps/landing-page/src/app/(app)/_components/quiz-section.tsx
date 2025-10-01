import { Fragment } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getURLFromMedia } from '@/payload/utils'
import type { Home } from '@/payload/types'

type QuizSectionProps = {
  data: Home['quizSection']
}

function CheckIcon() {
  return (
    <svg
      className="w-3 h-3 text-primary"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

const defaultFeatures = [
  { text: 'Get a Free Report' },
  { text: 'Scientifically validated assessments' },
  { text: 'Quick and confidential' },
]

export default function QuizSection({ data }: QuizSectionProps) {
  const illustrationUrl = getURLFromMedia(data?.quizImage ?? '')
  const features = data?.quizFeatures?.length ? data.quizFeatures : defaultFeatures

  return (
    <div className="bg-background py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 xl:px-25 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
          <div className="flex-1 max-w-2xl lg:max-w-none">
            <div className="space-y-6">
              {data?.quizTitle ? (
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground leading-tight">
                  <RichText data={data.quizTitle} disableContainer={true} />
                </div>
              ) : (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground leading-tight">
                  <span className="text-primary">Take a Free Mental Health Test Today!</span>
                  <br />
                  Know How You Feel.
                </h2>
              )}

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                {data?.quizDescription ||
                  'Scientifically validated standard assessments - quickest way to determine if you are suffering from symptoms of any mental health disorder.'}
              </p>

              <div className="space-y-3 pt-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon />
                    </div>
                    <p className="text-sm sm:text-base text-foreground">
                      {index === 0 && !data?.quizFeatures?.length ? (
                        <>
                          Get a <span className="font-semibold text-primary">Free Report</span>
                        </>
                      ) : (
                        feature.text
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Link href="/quiz">
                <Button className="w-full sm:w-auto">{data?.quizButtonText || 'Take the Test Now'}</Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-between w-full lg:w-[700px] xl:w-[780px]">
            {illustrationUrl ? (
              <div className="relative aspect-square w-full">
                <Image
                  src={illustrationUrl}
                  alt="Mental health illustration"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 700px, 780px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="relative aspect-square w-full bg-primary/10 rounded-3xl flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
