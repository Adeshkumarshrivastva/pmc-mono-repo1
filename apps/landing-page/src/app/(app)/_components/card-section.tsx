'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@/components/ui/icons'

type CardSectionProps = {
  data: Home['cardSection']
}

export default function CardSection({ data }: CardSectionProps) {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({})

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const cardsObj = data?.cards?.[0]
  
  const cardList = cardsObj 
    ? [
        { 
          image: cardsObj.card1, 
          button: cardsObj.card1Button, 
          link: cardsObj.card1Link,
          features: cardsObj.card1Features || [],
        },
        { 
          image: cardsObj.card2, 
          button: cardsObj.card2Button, 
          link: cardsObj.card2Link,
          features: cardsObj.card2Features || [],
        },
        { 
          image: cardsObj.card3, 
          button: cardsObj.card3Button, 
          link: cardsObj.card3Link,
          features: cardsObj.card3Features || [],
        },
      ].filter((card) => card.image) 
    : []

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
              <div className="relative w-full max-w-[1005px] mt-4 sm:mt-8 mx-auto">
                {/* Cards with Flip Animation */}
                <div className="relative flex justify-center items-end group px-1 sm:px-0">
                  {cardList.map((card, index) => (
                    <div
                      key={index}
                      className={cn(
                        'relative flex-shrink-0',
                        zClasses[index],
                      )}
                      style={{
                        width: '50.25%',
                        marginLeft: index === 0 ? '0' : '-25.37%',
                        perspective: '1000px',
                      }}
                    >
                      {/* Card Container with Flip */}
                      <div
                        className={cn(
                          'relative w-full transition-transform duration-700',
                        )}
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: flippedCards[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        {/* Front Side - Image */}
                        <div
                          className="relative w-full transition-all duration-200 ease-in-out hover:-translate-y-2 hover:scale-105 cursor-pointer drop-shadow-lg"
                          style={{
                            paddingBottom: '60.59%',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                          }}
                        >
                          <Image 
                            src={getURLFromMedia(card.image ?? '')} 
                            alt="" 
                            fill 
                            className="object-contain" 
                          />
                        </div>

                        {/* Back Side - Features */}
                        <div
                          className="absolute inset-0 bg-primary rounded-2xl p-6 flex flex-col justify-between"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                        >
                          <div className="space-y-3 overflow-y-auto flex-grow">
                            <h3 className="text-lg font-semibold text-primary-foreground mb-4">Features:</h3>
                            {card.features && card.features.length > 0 ? (
                              card.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-start gap-2">
                                  <CheckIcon className="size-5 text-accent bg-accent rounded-full flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-primary-foreground leading-relaxed">
                                    {feature.title}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-primary-foreground/80">No features available</p>
                            )}
                          </div>

                          <div className="space-y-3 mt-4">
                            <Link
                              href={card.link || '#'}
                              className="block w-full py-2 px-4 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors text-center text-sm"
                            >
                              {card.button || 'Explore'}
                            </Link>
                            
                            <button
                              onClick={() => toggleFlip(index)}
                              className="w-full py-2 px-4 text-primary-foreground hover:bg-primary-foreground/10 rounded-lg transition-colors text-sm"
                            >
                              ← Back
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Explore Button Below Card */}
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => toggleFlip(index)}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm sm:text-base"
                        >
                          {card.button || 'Explore'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
