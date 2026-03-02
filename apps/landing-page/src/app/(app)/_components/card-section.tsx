import Image from 'next/image'
import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { cn } from '@/lib/utils'

type CardSectionProps = {
  data: Home['cardSection']
}

export default function CardSection({ data }: CardSectionProps) {
  const cardsObj = data?.cards?.[0]
  const cardList = cardsObj ? [cardsObj.card1, cardsObj.card2, cardsObj.card3].filter(Boolean) : []

  if (cardList.length === 0) {
    data?.cards?.forEach((c) => {
      if (c.card1) cardList.push(c.card1)
    })
  }

  const zClasses = ['z-30', 'z-20', 'z-10']

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-14 xl:px-16 xl:py-18">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12 mb-8 sm:mb-10">
            <div className="max-w-lg">
              <h2 className="text-2xl font-semibold leading-tight text-primary sm:text-3xl md:text-4xl">
                {data?.title}
              </h2>
              <div className="text-xl font-semibold text-primary max-w-md mt-2">{data?.subTitle}</div>
            </div>

            <div className="flex flex-col items-end">
              <div className="max-w-[480px]">
                {data?.description ? (
                  <p className="text-lg text-foreground leading-relaxed opacity-80">{data.description}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="sm:pt-4 flex flex-col items-center justify-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary uppercase">{data?.cardHeading}</div>
            <div className="text-xl font-semibold text-primary mt-2">{data?.cardSubHeading}</div>

            {cardList.length > 0 ? (
              <div className="relative flex justify-center items-center w-full max-w-[1005px] mt-4 sm:mt-8 group px-1 sm:px-0 mx-auto">
                {cardList.map((card, index) => (
                  <div
                    key={index}
                    className={cn(`relative flex-shrink-0 transition-all duration-200 ease-in-out hover:-translate-y-2 hover:scale-105 hover:!z-50 group-hover:brightness-[0.8] hover:!brightness-110 cursor-pointer drop-shadow-lg`, zClasses[index])}
                    style={{
                      width: '50.25%',
                      marginLeft: index === 0 ? '0' : '-25.37%',
                    }}
                  >
                    <div className="relative w-full" style={{ paddingBottom: '60.59%' }}>
                      <Image
                        src={getURLFromMedia(card ?? '')}
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
