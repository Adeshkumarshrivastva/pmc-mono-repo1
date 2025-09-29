import { ClipboardPenIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import type { Booking } from '@/lib/booking'
import CreatePrescriptionForm from './create-prescription-form'

type PrescriptionProps = {
  prescription?: Booking['prescription'][number]
  bookingId: string
}

export default function PrescriptionArea({ prescription, bookingId }: PrescriptionProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  if (prescription) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Prescription</h3>
          <div className="text-sm text-muted-foreground">
            Created on {new Date(prescription.createdAt).toLocaleDateString()}
          </div>
        </div>

        {prescription.medicines && prescription.medicines.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Medicines</h4>
            {(
              prescription.medicines as Array<{
                name: string
                dosage: string
                frequency: string
                duration: string
                instructions?: string
              }>
            ).map((medicine, index: number) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">{medicine.name}</div>
                    <div className="text-sm text-muted-foreground">Dosage: {medicine.dosage}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Frequency: {medicine.frequency}</div>
                    <div className="text-sm text-muted-foreground">Duration: {medicine.duration}</div>
                  </div>
                  {medicine.instructions && (
                    <div className="col-span-2 text-sm text-muted-foreground">
                      Instructions: {medicine.instructions}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {prescription.notes && (
          <div className="space-y-2">
            <h4 className="font-medium">Notes</h4>
            <div className="p-3 bg-muted rounded-lg text-sm">{prescription.notes}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="text-center py-8">
      <div className="space-y-4">
        <div className="text-muted-foreground">No prescription available</div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button icon={<ClipboardPenIcon className="size-4" />}>Write Prescription</Button>
          </SheetTrigger>
          <SheetContent
            className="w-full sm:max-w-xl overflow-y-auto"
            onInteractOutside={(event) => {
              event.preventDefault()
            }}
          >
            <SheetHeader>
              <SheetTitle>Create Prescription</SheetTitle>
              <SheetDescription>Add medicines and notes for this patient's prescription.</SheetDescription>
            </SheetHeader>
            <Separator />
            <CreatePrescriptionForm
              bookingId={bookingId}
              onSuccess={() => {
                setIsSheetOpen(false)
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
