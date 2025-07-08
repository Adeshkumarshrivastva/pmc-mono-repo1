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
  return (
    <div
      className="bg-cover xl:bg-contain bg-bottom bg-no-repeat bg-primary h-[800px] flex items-center justify-between md:p-25"
      style={{ backgroundImage: `url(${getURLFromMedia(data?.heroSectionImage ?? '')})` }}
    >
      <div className="space-y-6">
        <div className="space-y-6 w-[484px]">
          <h1 className="text-3xl font-semibold text-primary-foreground">
            <RichText
              data={
                typeof data?.heroSectionTitle === 'string' ? JSON.parse(data.heroSectionTitle) : data?.heroSectionTitle
              }
              disableContainer={true}
            />
          </h1>
          <p className="text-lg text-primary-foreground font-medium font-secondary">
            {data?.heroSectionDescription ?? null}
          </p>
        </div>
        <Button variant="secondary" icon={<CallIcon />}>
          {data?.heroSectionAction}
        </Button>
      </div>
      <div className="space-y-4 w-72">
        <p className="text-lg text-primary-foreground font-medium font-secondary">
          {data?.heroSectionHeadline ?? null}
        </p>
        <div className="grid grid-cols-[1fr_1px_1fr] gap-4 w-full items-center">
          {data?.heroSectionDetails && data?.heroSectionDetails.length !== 0
            ? data.heroSectionDetails.map((item, index) => {
                return (
                  <Fragment key={index}>
                    {index % 2 === 0 ? (
                      <div className="col-span-full border-[0.5px] h-px shrink-0 border-primary-foreground border-dashed" />
                    ) : null}
                    <div className="col-span-1 text-primary-foreground flex flex-col justify-center">
                      <p className="text-sm font-light">{item.label}</p>
                      <p className="font-secondary font-semibold">{item.value}</p>
                    </div>
                    {index % 2 === 0 ? (
                      <div className="h-16 border-[0.5px] border-primary-foreground border-dashed" />
                    ) : null}
                  </Fragment>
                )
              })
            : null}
          <div className="col-span-3 border-[0.5px] h-px shrink-0 border-primary-foreground border-dashed" />
        </div>
      </div>
    </div>
  )
}
