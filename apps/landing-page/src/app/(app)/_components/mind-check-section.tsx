import type { Home } from '@/payload/types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { MindCheckQuiz } from './mind-check-quiz'

type MindCheckSectionProps = {
  data: Home['meterSection']
}

export default function MindCheckSection(_props: MindCheckSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12 xl:px-16 xl:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mind-check">
            <div className="mb-8 text-center sm:mb-10">
              <h2 className="text-[clamp(1.75rem,2.6vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-primary">
                Our PMC Package
              </h2>
            </div>
        {/* CMS heading (hidden):
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-2xl font-semibold leading-tight text-primary sm:text-3xl md:text-4xl">
            {data?.title ? <RichText data={data.title} disableContainer={true} /> : null}
          </h2>
          {data?.description ? (
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-primary opacity-80 sm:text-lg">
              {data.description}
            </p>
          ) : null}
        </div>
        */}
        {/* Hardcoded heading (hidden):
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-[clamp(1.75rem,2.6vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-primary">
            Check your mental health within 2 minutes
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-primary opacity-80 sm:text-lg">
            Take the 2-minute Mind Check and get your personalised wellness score.
          </p>
        </div>
        */}

            <MindCheckQuiz mode="intro" />
          </div>
        </div>
      </div>
    </section>
  )
}
