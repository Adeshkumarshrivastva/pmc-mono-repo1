import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { Button } from '@/components/ui/button'
import { CallIcon, ChatIcon, MedalRibbonIcon } from '@/components/ui/icons'

type WhyChooseSectionProps = {
  data: Home['whyChooseSection']
}

export default function WhyChooseSection({ data }: WhyChooseSectionProps) {
  return (
    <div className="w-full flex justify-around bg-primary px-9">
      <div className="flex flex-col justify-between items-start space-y-6 pt-10">
        <p className="text-5xl font-semibold text-primary-foreground max-w-[539px]">{data?.title ?? ''}</p>
        <Button icon={<CallIcon />} variant={'secondary'} className="font-normal">
          {data?.action}
        </Button>
        <Image
          alt="Deep TMS"
          width={564}
          height={800}
          className="object-contain h-auto"
          src={getURLFromMedia(data?.image ?? '')}
        />
      </div>
      <div className="space-y-6 pt-12">
        {data?.featuresCards && data.featuresCards.length !== 0
          ? data.featuresCards.map((feature, index) => (
              <div key={index} className="flex flex-col bg-accent space-y-4 p-6 w-[340px] h-[204px] rounded-md">
                <CallIcon className="h-12 w-12" />
                <span className="font-semibold text-sm">{feature.featureTitle}</span>
                <p>{feature.featureDescription}</p>
              </div>
            ))
          : null}
      </div>
    </div>
  )
}
