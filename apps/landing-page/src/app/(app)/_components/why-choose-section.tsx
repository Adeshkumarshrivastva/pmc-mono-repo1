import Image from 'next/image'
import { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { Button } from '@/components/ui/button'
import { CallIcon, ClipBoardNotesWithQuestionMark } from '@/components/ui/icons'
import SVGImageIcon from '@/components/svg-image-icon'

type WhyChooseSectionProps = {
  data: Home['whyChooseSection']
}

export default function WhyChooseSection({ data }: WhyChooseSectionProps) {
  return (
    <div className="w-full flex justify-around bg-primary px-9 overflow-hidden py-2">
      <div className="flex flex-col justify-between items-start space-y-6 pt-10">
        <p className="text-5xl font-semibold text-primary-foreground max-w-[539px]">{data?.title ?? ''}</p>
        <Button icon={<CallIcon />} variant={'secondary'} className="font-normal">
          {data?.action}
        </Button>
        <Image
          alt="Doctors"
          width={564}
          height={800}
          className="object-contain h-auto"
          src={getURLFromMedia(data?.image ?? '')}
        />
      </div>
      <div className="space-y-6 pt-12 overflow-auto max-h-[800px]">
        {data?.featuresCards && data.featuresCards.length !== 0
          ? data.featuresCards.map((feature, index) => (
              <div key={index} className="flex flex-col bg-accent space-y-4 p-6 w-[340px] h-[204px] rounded-md">
                {feature.featureIcon ? (
                  <SVGImageIcon src={getURLFromMedia(feature.featureIcon)} className="h-12 w-12 text-primary" />
                ) : (
                  <ClipBoardNotesWithQuestionMark className="h-12 w-12 text-primary" />
                )}
                <p className="font-semibold text-xl text-primary">{feature.featureTitle}</p>
                <p className="font-normal text-lg ">{feature.featureDescription}</p>
              </div>
            ))
          : null}
      </div>
    </div>
  )
}
