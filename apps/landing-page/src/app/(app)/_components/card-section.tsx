'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { CheckIcon } from '@/components/ui/icons'
import { toSiteHref } from '@/lib/links'

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
          backImage: cardsObj.card1Back,
          name: cardsObj.card1Name,
          price: cardsObj.card1Price,
          slug: cardsObj.card1Slug,
          button: cardsObj.card1Button,
          link: cardsObj.card1Link,
          features: cardsObj.card1Features || [],
        },
      ].filter((card) => card.image)
    : []

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
              <div
                className={`grid grid-cols-1 ${cardList.length > 1 ? 'sm:grid-cols-2' : ''} gap-10 sm:gap-12 mt-8 sm:mt-12 w-full max-w-3xl mx-auto place-items-center`}
              >
                {cardList.map((card, index) => {
                  const backImageUrl = card.backImage ? getURLFromMedia(card.backImage) : ''

                  return (
                    <div key={index} className="w-full max-w-sm flex flex-col items-center">
                      {/* Flip Card */}
                      <div className="relative w-full" style={{ perspective: '1000px' }}>
                        <div
                          className="relative w-full transition-transform duration-700"
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: flippedCards[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          }}
                        >
                          {/* Front Side */}
                          <div
                            className="relative w-full drop-shadow-lg"
                            style={{
                              paddingBottom: '60.59%',
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                            }}
                          >
                            <Image src={getURLFromMedia(card.image ?? '')} alt={card.name || ''} fill className="object-contain rounded-2xl" />
                          </div>

                          {/* Back Side */}
                          <div
                            className="absolute inset-0 rounded-2xl overflow-hidden drop-shadow-lg bg-primary"
                            style={{
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)',
                            }}
                          >
                            {backImageUrl ? (
                              <Image src={backImageUrl} alt={card.name || ''} fill className="object-contain" />
                            ) : (
                              <div className="p-6 flex flex-col h-full">
                                <h3 className="text-lg font-semibold text-primary-foreground mb-4">Features:</h3>
                                <div className="space-y-3 overflow-y-auto flex-grow">
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
                                    <p className="text-sm text-primary-foreground/80">No details available</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info & Actions (always visible, independent of flip state) */}
                      <div className="flex flex-col items-center gap-3 mt-4 w-full">
                        {card.name ? (
                          <div className="text-lg font-semibold text-primary text-center">{card.name}</div>
                        ) : null}

                        <div className="flex gap-3 w-full">
                          <button
                            onClick={() => toggleFlip(index)}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm sm:text-base"
                          >
                            {flippedCards[index] ? '← Back' : card.button || 'Explore'}
                          </button>

                          {card.price && card.slug ? (
                            <Link
                              href={`/cards/${card.slug}/book`}
                              className="flex-1 px-4 py-2 bg-card text-card-foreground rounded-lg font-medium hover:bg-card/90 transition-colors text-sm sm:text-base text-center"
                            >
                              Buy - ₹{card.price}
                            </Link>
                          ) : card.link ? (
                            <Link
                              href={toSiteHref(card.link)}
                              className="flex-1 px-4 py-2 bg-card text-card-foreground rounded-lg font-medium hover:bg-card/90 transition-colors text-sm sm:text-base text-center"
                            >
                              Learn More
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
