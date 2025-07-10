import { Button } from '@/components/ui/button'
import { CallIcon, OouiArrowPreviousLtr } from '@/components/ui/icons'
import { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

type ExportsectionProps = {
  data: Home['expertsSection']
}

export default function ExpertsSection({ data }: ExportsectionProps) {
  return (
    <div className="p-20">
      <div className="space-y-15">
        <div className="flex justify-between">
          <p className="font-semibold text-3xl max-w-[520px]">{data?.title}</p>
          <div className="flex gap-2">
            <Button
              icon={<OouiArrowPreviousLtr />}
              className="rounded-full h-7 w-7 text-foreground bg-white border"
            ></Button>
            <Button
              icon={<OouiArrowPreviousLtr />}
              className="rounded-full h-7 w-7 text-foreground bg-white border"
            ></Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-9">
          {data?.experts &&
            data?.experts.length > 0 &&
            data?.experts.map((expert) => {
              if (typeof expert === 'string') {
                return null
              }

              return (
                <div className="flex gap-8 bg-card p-3 rounded-xl">
                  <Image
                    alt="expert"
                    width={180}
                    height={190}
                    className="h-auto object-contain p-3 rounded-xl shadow-lg border-accent border"
                    src={getURLFromMedia(expert?.image ?? '')}
                  />
                  <div className="flex flex-col justify-around">
                    <div className="text-accent">
                      <p className="font-semibold text-xl">{expert.expertName}</p>
                      <p className="font-medium text-sm">{expert.profession}</p>
                    </div>
                    {expert?.headline ? (
                      <div className="text-sm text-accent">
                        <RichText data={expert.headline} disableContainer={true} />
                      </div>
                    ) : null}
                    <Button icon={<CallIcon />} variant={'secondary'} className="font-normal">
                      {data.action}
                    </Button>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
