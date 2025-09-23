import { createFileRoute, redirect } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_app/expert/bookings/')({
  component: ExpertBookings,
  beforeLoad: ({ context: { user } }) => {
    if (user.role === 'PATIENT') {
      throw redirect({ to: '/patient/dashboard' })
    }
  },
  loader: ({ context: { user } }) => {
    return { user }
  },
  pendingComponent: () => {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground text-xs font-medium">Loading...</div>
      </div>
    )
  },
})

function ExpertBookings() {
  return (
    <div className="h-full w-full flex flex-col space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Bookings</h1>
      </div>

      <Tabs defaultValue="upcoming" className="w-full flex-1 rounded-lg border">
        <div className="h-full flex flex-col overflow-auto">
          <div className="flex flex-col justify-between gap-y-2 lg:flex-row p-4">
            <TabsList className="w-full md:w-lg">
              <TabsTrigger value="upcoming" className="h-8 w-full lg:w-auto">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="h-8 w-full lg:w-auto">
                Past
              </TabsTrigger>
            </TabsList>
          </div>
          <Separator />
          <>
            <TabsContent value="upcoming" className="p-4">
              Upcoming Bookings
            </TabsContent>
            <TabsContent value="past" className="p-4">
              Past Bookings
            </TabsContent>
          </>
        </div>
      </Tabs>
    </div>
  )
}
