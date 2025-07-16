import { SolarAddCircleOutline } from '@/components/ui/icons'
import { AboutUs } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type TeamMembersSectionProps = {
  data: AboutUs['teamMembersSection']
}

export default function TeamMembersSection({ data }: TeamMembersSectionProps) {
  return (
    <div className="bg-primary flex justify-center items-center lg:p-22 xl:px-28 p-5">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 w-full">
        <p className="text-primary-foreground font-semibold md:text-3xl text-lg">{data?.title}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
          {data?.members &&
            data.members.length > 0 &&
            data.members.map((member, index) => {
              if (typeof member === 'string') return null

              return (
                <div key={index} className="bg-white rounded-lg flex flex-col overflow-hidden">
                  <div className="h-[350px] w-full">
                    <img
                      src={getURLFromMedia(member?.image ?? '')}
                      alt={member?.memberName ?? ''}
                      className="object-cover h-full w-full"
                    />
                  </div>

                  <div className="px-4 py-3 flex justify-between items-center text-primary">
                    <div>
                      <p className="font-medium text-lg">{member.memberName}</p>
                      {member?.role && <p className="text-sm opacity-80">{member.role}</p>}
                    </div>
                    <div className="h-9 w-9 text-primary rounded-full cursor-pointer text-xs font-normal flex justify-center items-center">
                      +
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
