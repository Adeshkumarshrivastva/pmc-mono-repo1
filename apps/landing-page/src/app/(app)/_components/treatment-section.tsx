import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { Button } from '@/components/ui/button'
import { ChatIcon, MedalRibbonIcon } from '@/components/ui/icons'

type TreatmentSectionProps = {
  data: Home['treatmentSection']
}

export default function TreatmentSection({ data }: TreatmentSectionProps) {
  return (
    <div className="w-full bg-accent p-12 md:p-25">
      <div className="flex flex-col items-center lg:flex-row max-w-7xl mx-auto">
        <Image
          alt="Deep TMS"
          width={564}
          height={800}
          className="object-contain h-auto"
          src={getURLFromMedia(data?.premaryImage ?? '')}
        />
        <div className="m-auto space-y-6 px-4 md:px-12 lg:px-16 lg:flex-1">
          <div className="space-y-8">
            <h1 className="text-5xl text-primary font-semibold">{data?.title}</h1>
            <RichText
              data={typeof data?.description === 'string' ? JSON.parse(data.description) : data?.description}
              disableContainer={true}
            />
          </div>
          <h2 className="font-medium font-secondary text-primary text-2xl">{data?.subTitle ?? ''}</h2>
          <Button icon={<ChatIcon />}>{data?.action}</Button>
          <div className="flex justify-between">
            <div className="space-y-6">
              {data?.featureList && data.featureList.length !== 0
                ? data.featureList.map((feature, index) => (
                    <div key={index} className="flex space-x-4">
                      <MedalRibbonIcon className="h-9 w-9" />
                      <span className="font-semibold text-xl">{feature.title}</span>
                    </div>
                  ))
                : null}
            </div>
            <Image
              width={356}
              height={280}
              alt="Deep TMS"
              src={getURLFromMedia(data?.secondryImage ?? '')}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
