'use client'
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Home } from '@/payload/types'
import { Button } from '@/components/ui/button'
import { ChatIcon } from '@/components/ui/icons'
import { getURLFromMedia } from '@/payload/utils'
import { cn } from '@/lib/utils'

type DeepTmsSectionProps = {
  data: Home['deepTmsSection']
  className?: string
  style?: React.CSSProperties
}

export default function DeepTMSSection({ data }: DeepTmsSectionProps) {
  return (
    <div className="w-full bg-accent p-12 md:p-25">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-3xl text-primary md:text-4xl font-semibold leading-tight">{data?.title}</h2>
        </div>
        <div>
          <div className="text-primary mb-4">
            <RichText
              data={typeof data?.description === 'string' ? JSON.parse(data.description) : data?.description}
              disableContainer={true}
            />
          </div>
          <Button variant="secondary" icon={<ChatIcon />} className="mt-2 bg-primary text-white px-5 py-2 rounded-md ">
            {data?.action}
          </Button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {data?.deepTmsFeatures?.map((feature, index) => (
          <div
            key={index}
            className={cn(
              'h-[402px] p-6 rounded-lg flex flex-col justify-between',
              feature.background === 'primary'
                ? 'bg-card text-white'
                : 'bg-card-foreground text-primary border border-green-900',
            )}
          >
            <div className="flex justify-between gap-2">
              <h3 className="text-3xl font-semibold mb-2">{feature.title}</h3>
              {feature.image ? (
                <Image
                  alt="background-image"
                  width={150}
                  height={150}
                  className="object-contain h-auto"
                  src={getURLFromMedia(feature.image ?? '')}
                />
              ) : null}
            </div>
            <div className="mt-2">
              <p className="text-base">{feature.description}</p>
              <div
                className={cn(
                  'mt-3 w-full h-[1px]',
                  feature.background === 'primary' ? 'bg-card-foreground' : 'bg-card',
                )}
              />
              {feature?.stampImage ? (
                <div className="mt-5">
                  <Image
                    alt="stamp image"
                    width={50}
                    height={50}
                    className="object-contain h-auto"
                    src={getURLFromMedia(feature.stampImage ?? '')}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
