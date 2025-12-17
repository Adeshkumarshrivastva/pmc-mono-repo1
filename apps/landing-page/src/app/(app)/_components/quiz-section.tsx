import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getURLFromMedia } from '@/payload/utils'
import type { Home } from '@/payload/types'

type QuizSectionProps = {
  data: Home['quizSection']
}

export default function QuizSection({ data }: QuizSectionProps) {
  const illustrationUrl = getURLFromMedia(data?.quizImage ?? '')

  return (
    <section className="w-full bg-primary">
      <div className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-20 relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex-1 max-w-2xl lg:max-w-none">
              <div className="space-y-6">
                {data?.quizTitle ? (
                  <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-primary-foreground leading-tight">
                    <RichText data={data.quizTitle} disableContainer={true} />
                  </div>
                ) : null}

                <p className="text-base sm:text-lg text-primary-foreground/80 leading-relaxed max-w-xl">
                  {data?.quizDescription ||
                    'Scientifically validated standard assessments - quickest way to determine if you are suffering from symptoms of any mental health disorder.'}
                </p>

                <div className="space-y-3 pt-4">
                  {data.quizFeatures?.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircleIcon />
                      </div>
                      <p className="text-sm sm:text-base text-primary-foreground">{feature.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <Link href="/quiz">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    {data?.quizButtonText}
                  </Button>
                </Link>
              </div>
            </div>

            {illustrationUrl ? (
              <div className="flex justify-center lg:justify-end">
                <div className="relative aspect-square w-full max-w-md lg:max-w-none">
                  <Image
                    src={illustrationUrl}
                    alt="Mental health illustration"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 700px, 780px"
                    className="object-contain"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
