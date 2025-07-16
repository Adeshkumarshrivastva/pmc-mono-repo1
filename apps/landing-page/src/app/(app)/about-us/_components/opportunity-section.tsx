import { Button } from '@/components/ui/button'
import { SolarBag4Linear, SolarCallChatRoundedBoldDuotone } from '@/components/ui/icons'
import { AboutUs } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'

type OpportunitySectionProps = {
  data: AboutUs['opportunitiesSection']
}

export default function OpportunitySection({ data }: OpportunitySectionProps) {
  return (
    <div className="md:px-28 md:py-10 items-center bg-accent p-5">
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row xl:justify-between gap-12">
        <div className="flex flex-col space-y-7 max-w-2xl justify-center">
          <p className="font-semibold text-4xl text-primary">{data?.title}</p>
          {data?.description ? (
            <div className="text-primary">
              <RichText data={data.description} />
            </div>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-5 items-center">
            <Button icon={<SolarBag4Linear />}>{data?.action}</Button>
            <Button icon={<SolarCallChatRoundedBoldDuotone />} variant={'secondary'} className="border border-primary ">
              {data?.subAction}
            </Button>
          </div>
        </div>
        <img
          alt="opportunities"
          width={572}
          height={576}
          className="object-contain rounded-xl lg:max-w-[36%] xl:max-w-full"
          src={getURLFromMedia(data?.image ?? '')}
        />
      </div>
    </div>
  )
}
