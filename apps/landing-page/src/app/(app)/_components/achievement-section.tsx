'use client'

import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import SVGImageIcon from '@/components/svg-image-icon'

type AchievementSectionProps = {
  data: Home['achievementSection']
}

export default function AchievementSection({ data }: AchievementSectionProps) {
  return (
    <section className="w-full bg-primary">
      <div className="px-4 py-8 sm:px-6 lg:px-12 xl:px-16 sm:py-12">
        <div className="max-w-7xl mx-auto text-center">
          {data?.title && (
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-10">{data.title}</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.achievements?.map((item, index) => (
              <div
                key={item.id ?? index}
                className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 space-y-6"
              >
                <div className="flex flex-col items-center justify-cent gap-4">
                  <div className="text-primary">
                    {item.icon && <SVGImageIcon src={getURLFromMedia(item.icon)} className="h-10 w-10 text-primary" />}
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-primary">{item.number}</p>
                </div>
                <p className="text-primary font-semibold md:text-xl">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
