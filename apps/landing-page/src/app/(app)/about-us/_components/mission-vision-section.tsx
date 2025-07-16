import { RichText } from '@payloadcms/richtext-lexical/react'
import { AboutUs } from '@/payload/types'
import { cn } from '@/lib/utils'

type MissionVisionStoryProps = {
  data: AboutUs['missionVisionStory']
}

export default function MissionVisionSection({ data }: MissionVisionStoryProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 lg:space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            <div>
              <h2
                id="mission-vision-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-foreground"
              >
                {data?.purposeHeading}
              </h2>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <ContentBlock heading={data?.mission?.heading} description={data?.mission?.description} />
              <ContentBlock heading={data?.vision?.heading} description={data?.vision?.description} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            <div>
              {data?.storyIntro && (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-foreground">
                  {data?.storyIntro}
                </h2>
              )}
            </div>

            <div>
              <ContentBlock heading={data?.storyContent?.heading} description={data?.storyContent?.story} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const ContentBlock = ({
  heading,
  description,
  className,
}: {
  heading?: string | null
  // TODO: Fix type error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description?: any
  className?: string
}) => {
  if (!heading && !description) return null

  return (
    <div className={cn('space-y-3 sm:space-y-4', className)}>
      {heading && <h3 className="font-semibold text-xl sm:text-2xl text-primary leading-tight">{heading}</h3>}
      {description && (
        <div className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          <RichText data={description} />
        </div>
      )}
    </div>
  )
}
