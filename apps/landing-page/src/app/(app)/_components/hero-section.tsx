import { Fragment } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Button } from '@/components/ui/button'
import { CallIcon } from '@/components/ui/icons'
import { getURLFromMedia } from '@/payload/utils'
import { Home } from '@/payload/types'

type HeroSectionProps = {
  data: Home['heroSetion']
}

export default function HeroSection({ data }: HeroSectionProps) {
  const backgroundImageUrl = getURLFromMedia(data?.heroSectionImage ?? '')

  return (
    <div
      className="bg-cover bg-center bg-no-repeat bg-primary min-h-[600px] sm:min-h-[700px] xl:min-h-[800px] xl:bg-contain xl:bg-bottom flex items-center"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 xl:px-25">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 xl:gap-12">
          <div className="flex-1 max-w-2xl xl:max-w-none">
            <div className="space-y-6 xl:w-[484px]">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-semibold text-primary-foreground leading-tight">
                <RichText data={data?.heroSectionTitle!} disableContainer={true} />
              </h1>

              {data?.heroSectionDescription ? (
                <p className="sm:text-lg text-primary-foreground font-medium font-secondary leading-relaxed">
                  {data.heroSectionDescription}
                </p>
              ) : null}
            </div>

            {data?.heroSectionAction ? (
              <div className="mt-8">
                <Button variant="secondary" icon={<CallIcon />} className="w-full sm:w-auto">
                  {data.heroSectionAction}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex-shrink-0 w-full xl:w-72">
            <div className="space-y-4 p-6">
              <p className="hidden xl:block sm:text-lg text-primary-foreground font-medium font-secondary">
                {data?.heroSectionHeadline}
              </p>

              {data?.heroSectionDetails && data.heroSectionDetails.length > 0 ? (
                <div className="space-y-4">
                  <div className="hidden xl:block">
                    <div className="grid grid-cols-[1fr_1px_1fr] gap-4 w-full items-center">
                      {data.heroSectionDetails.map((item, index) => (
                        <Fragment key={index}>
                          {index % 2 === 0 && (
                            <div className="col-span-full border-[0.5px] h-px shrink-0 border-primary-foreground border-dashed" />
                          )}
                          <div className="col-span-1 text-primary-foreground flex flex-col justify-center">
                            <p className="text-sm font-light">{item.label}</p>
                            <p className="font-secondary font-semibold">{item.value}</p>
                          </div>
                          {index % 2 === 0 && (
                            <div className="h-16 border-[0.5px] border-primary-foreground border-dashed" />
                          )}
                        </Fragment>
                      ))}
                      <div className="col-span-3 border-[0.5px] h-px shrink-0 border-primary-foreground border-dashed" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
