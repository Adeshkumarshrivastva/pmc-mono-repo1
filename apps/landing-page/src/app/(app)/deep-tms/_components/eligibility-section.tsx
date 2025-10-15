import { Button } from '@/components/ui/button'
import { CallIcon } from '@/components/ui/icons'
import type { DeepTm } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'
import AppointmentForm from '../../_components/appointment-form'

export type EligibilityProps = {
  data: DeepTm['deepTmsEligibilitySection']
}

export function EligibilitySection({ data }: EligibilityProps) {
  return (
    <div className="flex justify-center items-center p-5 md:p-20 bg-accent">
      <div className="flex md:gap-16 gap-4 justify-between flex-col lg:flex-row">
        {data?.image && (
          <Image
            alt="Doctors"
            width={572}
            height={576}
            className="h-auto object-contain rounded-xl"
            src={getURLFromMedia(data.image)}
          />
        )}

        <div className="flex flex-col items-start justify-around gap-4">
          <div className="space-y-3 md:space-y-10">
            <p className="font-semibold text-2xl md:text-5xl text-primary">{data?.title}</p>
            <div className="flex flex-col space-y-2 md:space-y-8 font-display">
              <p className="font-semibold text-lg">{data?.subTitle}</p>
              {data?.eligibilityList &&
                data.eligibilityList.length > 0 &&
                data.eligibilityList.map((currentEligibility) => (
                  <p key={currentEligibility.id} className="text-lg">
                    {currentEligibility.addEligibility}
                  </p>
                ))}
            </div>
          </div>
          {data?.action ? (
            <AppointmentForm
              trigger={
                <Button variant="default" icon={<CallIcon />} className="w-full sm:w-auto">
                  {data.action}
                </Button>
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
