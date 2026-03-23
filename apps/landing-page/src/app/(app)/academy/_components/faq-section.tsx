'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Academy } from '@/payload/types'
import { Minus, Plus } from 'lucide-react'

type FAQSectionProps = {
  data: Academy['faqSection']
}

export default function FAQSection({ data }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="w-full bg-accent px-4 py-8 sm:px-6 sm:py-12 md:px-8 lg:px-12 lg:py-18">
      <div className="w-full max-w-7xl mx-auto col-span-2">
        <h2 className="text-xl sm:text-2xl lg:text-3xl text-primary font-medium w-full mb-6 md:mb-10">{data?.title}</h2>
        {data?.qna?.map((faq, idx) => (
          <div key={idx} className="border-b-2 border-muted-foreground/10">
            <button
              onClick={() => toggleIndex(idx)}
              className={cn(
                'w-full text-left flex justify-between items-center cursor-pointer',
                openIndex === idx ? 'px-4 py-3' : 'px-2 py-6',
              )}
            >
              <span className="text-base sm:text-xl lg:text-2xl leading-relaxed">{`${idx + 1}. ${faq.question}`}</span>

              <span className="flex-shrink-0 mt-1">
                {openIndex === idx ? <Minus className="size-4 sm:size-5" /> : <Plus className="size-4 sm:size-5" />}
              </span>
            </button>

            {openIndex === idx && faq.answer && (
              <div
                id={`faq-answer-${idx}`}
                className="px-2 sm:px-3 pb-4 sm:pb-5 animate-in slide-in-from-top-2 duration-200"
                role="region"
              >
                <div className="text-sm sm:text-base lg:text-xl font-light leading-relaxed">{faq.answer}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
