'use client'

import { useState } from 'react'
import { Home } from '@/payload/types'
import { SqureMinusIcon, SqurePlusIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

type FAQSectionProps = {
  data: Home['faqSection']
}

export default function FAQSection({ data }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="bg-accent py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl lg:text-5xl font-semibold mb-6 sm:mb-8 text-center sm:text-left">
          {data?.title}
        </h2>

        <div className="space-y-2 sm:space-y-3">
          {data?.faqQuestionsAndAnswer?.map((faq, idx) => (
            <div key={idx}>
              <button
                onClick={() => toggleIndex(idx)}
                className={cn(
                  'w-full text-left px-4 py-3 flex justify-between items-center font-medium cursor-pointer',
                  openIndex === idx ? 'bg-primary text-primary-foreground' : '',
                )}
              >
                <span className="text-sm sm:text-base lg:text-lg leading-relaxed">{`${idx + 1}. ${faq.question}`}</span>

                <span className="flex-shrink-0 mt-1">
                  {openIndex === idx ? (
                    <SqureMinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <SqurePlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </span>
              </button>

              {openIndex === idx && faq.answer && (
                <div
                  id={`faq-answer-${idx}`}
                  className="px-4 sm:px-6 py-4 sm:py-5 bg-primary text-primary-foreground animate-in slide-in-from-top-2 duration-200"
                  role="region"
                >
                  <div className="text-sm sm:text-base leading-relaxed">{faq.answer}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
