import { NAVBAR_HEIGHT } from '@/lib/constants'
import OutingBookingForm from './_components/outing-booking-form'

export default function OutingBookingPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <OutingBookingForm />
    </div>
  )
}
