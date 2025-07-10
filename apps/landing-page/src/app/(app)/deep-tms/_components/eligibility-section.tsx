import { Button } from '@/components/ui/button'
import { CallIcon } from '@/components/ui/icons'
import { DeepTm } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'

export type EligibilityProps = {
  data: DeepTm['deepTmsEligibilitySection']
}

export function EligibilitySection({ data }: EligibilityProps) {
  return (
    <div className="flex justify-center items-center p-5 md:p-20">
      <div className="flex md:gap-16 gap-4 justify-between flex-col lg:flex-row">
        <Image
          alt="Doctors"
          width={572}
          height={576}
          className="h-auto object-contain"
          src={getURLFromMedia(data?.image ?? '')}
        />
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
          <Button icon={<CallIcon />} className="font-normal">
            {data?.action}
          </Button>
        </div>
      </div>
    </div>
  )
}
