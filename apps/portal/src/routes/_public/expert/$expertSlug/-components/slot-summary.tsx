import { ArrowLeftIcon } from 'lucide-react'
import { invariant } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useBooking } from '../-hooks/use-booking'

type SlotSummaryProps = {
  onBack: () => void
}

export default function SlotSummary({ onBack }: SlotSummaryProps) {
  const { getSelectedSlot } = useBooking()
  const selectedSlot = getSelectedSlot()
  invariant(selectedSlot, 'Selected slot is required')

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        icon={<ArrowLeftIcon className="text-primary size-6" />}
        onClick={() => {
          onBack()
        }}
      />
      <div>
        <div>Your selected slot:</div>
        <div>{selectedSlot.toString()}</div>
      </div>
    </div>
  )
}
