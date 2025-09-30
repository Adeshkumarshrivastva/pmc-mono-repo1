import { ClipboardPenIcon, EditIcon, DownloadIcon } from 'lucide-react'
import { useState } from 'react'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import type { Booking } from '@/lib/booking'
import CreatePrescriptionForm from './create-prescription-form'
import EditPrescriptionForm from './edit-prescription-form'
import dayjs from '@/lib/dayjs'
import { utcDateToLocalDate } from '@/lib/date'

type PrescriptionProps = {
  prescription?: Booking['prescription'][number]
  bookingId: string
}

export default function PrescriptionArea({ prescription, bookingId }: PrescriptionProps) {
  const [mode, setMode] = useState<{ type: 'create' | 'edit' } | undefined>(undefined)

  return (
    <>
      {prescription ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Prescription</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<EditIcon className="size-4" />}
                onClick={() => setMode({ type: 'edit' })}
              >
                Edit
              </Button>
              <Button variant="outline" size="sm" icon={<DownloadIcon className="size-4" />}>
                Download
              </Button>
            </div>
          </div>

          {prescription.medicines && prescription.medicines.length > 0 ? (
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
          ) : null}

          {prescription.notes ? (
            <div className="space-y-2">
              <h4 className="font-medium">Notes</h4>
              <div className="p-3 bg-muted rounded-lg text-sm">{prescription.notes}</div>
            </div>
          ) : null}

          <div className="text-sm text-muted-foreground pt-2 border-t">
            Prescribed on {dayjs(utcDateToLocalDate(dayjs(prescription.createdAt).toDate())).format('D MMMM YYYY')}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="space-y-4">
            <div className="text-muted-foreground">No prescription available</div>
            <Button icon={<ClipboardPenIcon className="size-4" />} onClick={() => setMode({ type: 'create' })}>
              Write Prescription
            </Button>
          </div>
        </div>
      )}

      <Sheet open={!!mode} onOpenChange={(open) => !open && setMode(undefined)}>
        <SheetContent
          className="w-full sm:max-w-xl overflow-y-auto"
          onInteractOutside={(event) => {
            event.preventDefault()
          }}
        >
          {match(mode)
            .returnType<React.ReactNode>()
            .with({ type: 'create' }, () => (
              <>
                <SheetHeader>
                  <SheetTitle>Create Prescription</SheetTitle>
                  <SheetDescription>Add medicines and notes for this patient's prescription.</SheetDescription>
                </SheetHeader>
                <Separator />
                <CreatePrescriptionForm
                  bookingId={bookingId}
                  onSuccess={() => {
                    setMode(undefined)
                  }}
                />
              </>
            ))
            .with({ type: 'edit' }, () => (
              <>
                <SheetHeader>
                  <SheetTitle>Edit Prescription</SheetTitle>
                  <SheetDescription>Update medicines and notes for this patient's prescription.</SheetDescription>
                </SheetHeader>
                <Separator />
                <EditPrescriptionForm
                  prescription={prescription!}
                  onSuccess={() => {
                    setMode(undefined)
                  }}
                />
              </>
            ))
            .otherwise(() => null)}
        </SheetContent>
      </Sheet>
    </>
  )
}
