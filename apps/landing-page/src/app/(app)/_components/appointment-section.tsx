import { match, P } from 'ts-pattern'
import { FacebookIcon, InstagramIcon } from '@/components/ui/icons'
import { Home } from '@/payload/types'
import { Button } from '@/components/ui/button'

type AppointmentSectionProps = {
    data: Home['appointmentSection']
}

export default function AppointmentSection({ data }: AppointmentSectionProps) {

    return (
        <div className="w-full bg-primary py-12 px-28 ">
            <div className="w-full max-w-7xl mx-auto">
                <div className="bg-primary-foreground rounded-xl h-[700px] border border-border p-16">
                    <div className="flex flex-col h-full md:flex-row md:items-center md:justify-between md:space-x-20">
                        <div className="flex-1 flex flex-col h-full">
                            <div className="space-y-6 flex-1">
                                <div className="text-primary text-sm font-bold">APPOINTMENT</div>
                                <div className="font-semibold text-5xl">{data?.appointmentSection?.title}</div>
                                <div className="flex justify-between">
                                    <div>
                                        <div className="text-2xl font-semibold">Our Contact</div>
                                        <div className="mt-4 space-y-2">
                                            {data?.appointmentSection?.contacts && data.appointmentSection.contacts.length !== 0
                                                ? data?.appointmentSection.contacts.map((contact, index) => (
                                                    <div key={index} className="font-secondary text-muted-foreground font-medium">
                                                        {contact.phone}
                                                    </div>
                                                ))
                                                : null}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-semibold">Location</div>
                                        <div className="mt-4 font-secondary text-muted-foreground font-medium">
                                            {data?.appointmentSection?.location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {data?.appointmentSection?.socialMediaLinks && data?.appointmentSection?.socialMediaLinks.length !== 0
                                    ? data?.appointmentSection?.socialMediaLinks.map((platform, index) => (
                                        <div key={index}>
                                            {match(platform.socialMediaPlatform)
                                                .returnType<React.ReactNode>()
                                                .with('facebook', () => <FacebookIcon className="text-primary h-8 w-8" />)
                                                .with('instagram', () => <InstagramIcon className="text-primary h-8 w-8" />)
                                                .with('x', () => <FacebookIcon className="text-primary h-8 w-8" />)
                                                .with('linkedin', () => (
                                                    <FacebookIcon className="text-primary h-8 w-8" />
                                                )).with(P._, () => null)
                                                .exhaustive()}
                                        </div>
                                    ))
                                    : null}
                            </div>
                        </div>
                        <div className="">
                            <form className='border border-border grid grid-cols-2 gap-4 p-8 rounded-xl'>
                                <div className='col-span-1'>
                                    <label className='text-muted-foreground uppercase text-xs font-semibold'>Your Name</label>
                                    <input
                                        type="text"
                                        className='w-full border border-border rounded-lg p-2 mt-2'
                                    />
                                </div>
                                <div className='col-span-1'>
                                    <label className='text-muted-foreground uppercase text-xs font-semibold'>Email Address</label>
                                    <input
                                        type="text"
                                        className='w-full border border-border rounded-lg p-2 mt-2'
                                    />
                                </div>
                                <div className='col-span-1'>
                                    <label className='text-muted-foreground uppercase text-xs font-semibold'>Phone Number</label>
                                    <input
                                        type="text"
                                        className='w-full border border-border rounded-lg p-2 mt-2'
                                    />
                                </div>
                                <div className='col-span-1'>
                                    <label className='text-muted-foreground uppercase text-xs font-semibold'>Services</label>
                                    <select
                                        className='w-full border border-border rounded-lg p-2 mt-2'
                                    >
                                        <option selected>Choose one</option>
                                    </select>
                                </div>
                                <div className='col-span-2'>
                                    <label className='text-muted-foreground uppercase text-xs font-semibold'>Date</label>
                                    <input
                                        type="date"
                                        className='w-full border border-border rounded-lg p-2 mt-2'
                                    />
                                </div>
                                <div className='col-span-2'>
                                    <label className='text-muted-foreground uppercase text-xs font-semibold'>Time</label>
                                    <input
                                        type="time"
                                        className='w-full border border-border rounded-lg p-2 mt-2'
                                    />
                                </div>
                                <Button className='col-span-2 mt-2'>MAKE APPOINTMENT</Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
