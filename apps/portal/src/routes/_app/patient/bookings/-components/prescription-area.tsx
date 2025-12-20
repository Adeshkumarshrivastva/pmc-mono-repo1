import { DownloadIcon } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { InferResponseType } from 'hono/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import dayjs from '@/lib/dayjs'
import { utcDateToLocalDate } from '@/lib/date'
import { honoClient } from '@/lib/hono-client'
import { downloadBlobAsFile, getErrorMessage } from '@/lib/utils'

type PatientBookingsResponse = InferResponseType<(typeof honoClient)['server']['patient']['bookings']['$get'], 200>

type Booking = PatientBookingsResponse['bookings'][number]

type PrescriptionProps = {
  prescription?: Booking['prescription'][number]
}

export default function PrescriptionArea({ prescription }: PrescriptionProps) {
  const downloadPrescriptionMutation = useMutation({
    mutationFn: async ({ prescriptionId }: { prescriptionId: string }) => {
      const response = await honoClient.server.experts.bookings['download-prescription'][':prescriptionId'].$post({
        param: { prescriptionId },
      })
      if (!response.ok) {
        throw new Error('Failed to download prescription')
      }
      return response.blob()
    },
    onSuccess: (blob) => {
      downloadBlobAsFile(blob, `prescription-${Date.now()}.pdf`)
      toast.success('Prescription downloaded successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  return (
    <>
      {prescription ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Prescription</h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  downloadPrescriptionMutation.mutate({
                    prescriptionId: prescription.id,
                  })
                }}
                disabled={downloadPrescriptionMutation.isPending}
                loading={downloadPrescriptionMutation.isPending}
                variant="outline"
                size="sm"
                icon={<DownloadIcon className="size-4" />}
              >
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
          <div className="text-muted-foreground">No prescription available yet</div>
        </div>
      )}
    </>
  )
}
