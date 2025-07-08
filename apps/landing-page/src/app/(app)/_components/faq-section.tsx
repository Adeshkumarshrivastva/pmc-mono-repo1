'use client'
import React, { useState } from 'react'
import { Home } from '@/payload/types'
import { SqureMinusIcon, SqurePlusIcon } from '@/components/ui/icons'

type FAQSectionProps = {
  data: Home['faqSection']
  className?: string
  style?: React.CSSProperties
}

export default function FAQSection({ data }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="bg-accent">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">{data?.title}</h2>
        <div className="space-y-2">
          {data &&
            data.faqQuestionsAndAnswer?.map((faq, idx) => (
              <div key={idx}>
                <button
                  onClick={() => toggleIndex(idx)}
                  className={`w-full text-left px-4 py-3 flex justify-between items-center font-medium ${
                    openIndex === idx ? 'bg-primary text-white' : ''
                  }`}
                >
                  <span>{`${idx + 1}. ${faq.question}`}</span>
                  {openIndex === idx ? (
                    <SqureMinusIcon className="w-4 h-4 cursor-pointer" />
                  ) : (
                    <SqurePlusIcon className="w-4 h-4 cursor-pointer" />
                  )}
                </button>
                {openIndex === idx && faq.answer && (
                  <div className="px-4 py-3 bg-primary text-white text-sm">{faq.answer}</div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
