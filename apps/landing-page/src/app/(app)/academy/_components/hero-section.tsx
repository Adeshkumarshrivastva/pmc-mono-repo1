import Image from 'next/image'
import Link from 'next/link'
import type { Academy } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type HeroSectionProps = {
  data: Academy['heroSection']
}

export default function HeroSection({ data }: HeroSectionProps) {
  const backgroundImageUrl = getURLFromMedia(data?.sectionImage ?? '')

  return (
    <div className="bg-primary min-h-[600px] md:min-h-[700px] flex items-center relative overflow-hidden p-8">
      <Image
        src={backgroundImageUrl}
        alt="Hero background"
        fill
        sizes="33vw"
        className="hidden object-cover sm:block "
        priority
      />

      <div className="relative z-10 mx-auto w-full xl:px-10 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center max-w-7xl space-y-6 md:space-y-10">
          <div className="max-w-5xl space-y-6 md:space-y-10">
            <h1 className="text-center text-2xl font-semibold text-accent md:text-4xl lg:text-6xl">
              {data?.title || ''}
            </h1>
            <h2 className="text-center text-lg text-accent md:text-xl lg:text-2xl">{data?.subTitle || ''}</h2>
            <div className="text-center max-w-2xl lg:max-w-4xl mx-auto text-base text-accent lg:text-xl">
              {data?.description || ''}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {data?.cards?.map((card, index) => (
              <Card key={index} className="bg-accent/20 border-none rounded-md pb-3">
                <CardContent className="text-background space-y-4">
                  <Image src={getURLFromMedia(card?.icon ?? '')} alt="Card icon" width={24} height={24} />
                  <div className="text-base lg:font-medium lg:text-lg">{card?.text || ''}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Link href={data?.buttonLink || '#'}>
              <Button variant="secondary" className="font-medium">
                <div className="px-2">{data?.button || ''}</div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
