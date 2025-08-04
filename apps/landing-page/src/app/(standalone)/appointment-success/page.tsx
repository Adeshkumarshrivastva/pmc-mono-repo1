import { notFound } from 'next/navigation'
import { CheckIcon } from '@/components/ui/icons'
import { getAppointmentById } from '@/payload/actions/appointments/appointments.actions'
import { Service } from '@/payload/types'

export default async function AppointmentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = await searchParams

  if (!appointmentId) {
    return notFound()
  }
  const appointment = await getAppointmentById(appointmentId)

  if (!appointment) {
    return notFound()
  }

  return (
    <div className="mx-auto flex max-w-screen-md flex-col items-center justify-center px-4 py-20">
      <CheckIcon className="size-20 text-accent" aria-hidden="true" />

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-primary-foreground">Appointment Confirmed</h1>

      <p className="mt-2 text-lg text-primary-foreground/80">Thank you {appointment.fullName}, for booking with us!</p>

      <section aria-labelledby="details-heading" className="mt-8 w-full max-w-lg rounded-xl bg-white p-6 shadow-md">
        <h2 id="details-heading" className="sr-only">
          Appointment details
        </h2>

        <DetailItem label="Service" value={(appointment.service as Service).name} />
        <DetailItem label="Date & Time" value={new Date(appointment.dateTime).toLocaleString()} />
        <DetailItem
          label="Amount"
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
          }).format(appointment.amount)}
        />
        <DetailItem label="Order ID" value={appointment.orderId ?? ''} />
      </section>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-3 last:border-b-0">
      <dt className="font-medium text-foreground/70">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}
