import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import CardBookingFormSection from './_components/card-booking-form-section'

type CardBookingPageProps = {
  params: Promise<{
    cardSlug: string
  }>
}

export default async function CardBookingPage({ params }: CardBookingPageProps) {
  const { cardSlug } = await params
  const payload = await getPayloadClient()

  const homeData = await payload.findGlobal({
    slug: 'home',
  })

  const cardsObj = homeData.cardSection?.cards?.[0]

  const cardList = cardsObj
    ? [
        { name: cardsObj.card1Name, price: cardsObj.card1Price, slug: cardsObj.card1Slug },
        { name: cardsObj.card2Name, price: cardsObj.card2Price, slug: cardsObj.card2Slug },
        { name: cardsObj.card3Name, price: cardsObj.card3Price, slug: cardsObj.card3Slug },
      ]
    : []

  const cardData = cardList.find((card) => card.slug === cardSlug)

  if (!cardData || !cardData.price) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <CardBookingFormSection
        cardName={cardData.name || ''}
        cardPrice={String(cardData.price)}
        cardSlug={cardSlug}
      />
    </div>
  )
}
