'use client'

import { DialogTrigger } from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

type AppointmentFormProps = {
  trigger: React.ReactNode
}

export default function AppointmentForm({ trigger }: AppointmentFormProps) {
  // TODO: Open form in Drawer in mobile
  return (
    <Dialog>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="bg-primary-foreground">
        <DialogHeader>
          <DialogTitle>Book Trial Session</DialogTitle>
          <DialogDescription>
            Fill out the form below, and we&apos;ll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <InputForm />
      </DialogContent>
    </Dialog>
  )
}

function InputForm() {
  return (
    <form className="border border-border rounded-xl p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="col-span-1">
          <label htmlFor="name" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Your Name
          </label>
          <input
            type="text"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your name"
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="phone" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your phone"
          />
        </div>

        <div className="col-span-full">
          <label htmlFor="email" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your email"
          />
        </div>

        <div className="col-span-full sm:col-span-1">
          <label htmlFor="date" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Date
          </label>
          <input
            id="date"
            type="date"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="col-span-full sm:col-span-1">
          <label htmlFor="time" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Time
          </label>
          <input
            id="time"
            type="time"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="col-span-full sm:col-span-2 pt-2">
          <Button
            type="submit"
            className="w-full py-3 text-sm font-semibold tracking-wider hover:bg-primary/90 transition-colors"
          >
            MAKE APPOINTMENT
          </Button>
        </div>
      </div>
    </form>
  )
}
