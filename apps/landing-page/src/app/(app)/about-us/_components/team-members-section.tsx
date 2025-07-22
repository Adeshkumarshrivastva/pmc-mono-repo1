'use client'

import { useState } from 'react'
import { AboutUs } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'

type TeamMembersSectionProps = {
  data: AboutUs['teamMembersSection']
}

export default function TeamMembersSection({ data }: TeamMembersSectionProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())

  const toggleCard = (index: number) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <div className="bg-primary flex justify-center items-center lg:p-22 xl:px-28 p-5">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 w-full">
        <p className="text-primary-foreground font-semibold md:text-3xl text-lg">{data?.title}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
          {data?.members &&
            data.members.length > 0 &&
            data.members.map((member, index) => {
              if (typeof member === 'string') return null

              const isFlipped = flippedCards.has(index)

              return (
                <div key={index} className="bg-white rounded-lg overflow-hidden h-[430px] relative">
                  <div
                    className={`absolute inset-0 transition-transform duration-700 transform-style-preserve-3d ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    <div className="absolute inset-0 backface-hidden flex flex-col">
                      <div className="h-[350px] w-full">
                        <img
                          src={getURLFromMedia(member?.image ?? '')}
                          alt={member?.memberName ?? ''}
                          className="object-cover h-full w-full"
                        />
                      </div>

                      <div className="px-4 py-3 flex justify-between items-center text-primary">
                        <div className="max-w-[220px]">
                          <p className="font-medium text-lg">{member.memberName}</p>
                          {member?.role && <p className="text-sm opacity-80">{member.role}</p>}
                        </div>
                        <button
                          onClick={() => toggleCard(index)}
                          className="h-9 w-9 text-primary rounded-full cursor-pointer flex justify-center items-center border text-xl hover:bg-primary hover:text-white transition-colors duration-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div
                      className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col p-6 justify-between bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${getURLFromMedia(member?.image ?? '')})` }}
                    >
                      <div className="absolute inset-0 bg-black/60"></div>

                      <div className="relative z-10 space-y-4 text-primary-foreground">
                        <div className="text-center">
                          <h3 className="font-semibold text-xl mb-1">{member.memberName}</h3>
                          {member?.role && (
                            <p className="text-primary-foreground/70 text-sm font-medium">{member.role}</p>
                          )}
                        </div>

                        {member?.bio ? (
                          <div className="space-y-3 text-sm text-primary-foreground/80 overflow-auto">
                            <RichText data={member.bio} disableContainer={true} />
                          </div>
                        ) : null}
                      </div>

                      <button
                        onClick={() => toggleCard(index)}
                        className="relative z-10 h-9 w-9 text-primary rounded-full cursor-pointer font-normal flex justify-center items-center text-xl border hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors duration-200 self-end mt-4"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
