import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { honoClient } from '@/lib/hono-client'
import ExpertInfoForm from '../-components/expert-info-form'
import ExpertAvailabilityForm from '../-components/expert-availability-form'
import { BlockedDatesCalendar } from '../-components/blocked-dates-calendar'
import { ExpertServicesSection } from './-components/expert-services-section'

export const Route = createFileRoute('/_app/admin/experts/$expertId/edit')({
  component: EditExpertPage,
  loader: async ({ params }) => {
    const { expertId } = params

    const [expertResponse, availabilityResponse] = await Promise.all([
      honoClient.server.admin.experts[':expertId'].$get({
        param: { expertId },
      }),
      honoClient.server.admin.experts[':expertId'].availability.$get({
        param: { expertId },
      }),
    ])

    if (!expertResponse.ok) {
      throw new Error('Failed to fetch expert details')
    }

    if (!availabilityResponse.ok) {
      throw new Error('Failed to fetch availability')
    }

    const [expertData, availabilityData] = await Promise.all([expertResponse.json(), availabilityResponse.json()])

    return {
      expert: expertData,
      availability: availabilityData,
    }
  },
  pendingComponent: () => (
    <div className="flex h-screen w-full items-center justify-center gap-2">
      <Spinner />
      <div className="text-muted-foreground text-xs font-medium">Loading expert details...</div>
    </div>
  ),
})

function EditExpertPage() {
  const { expertId } = Route.useParams()
  const { expert, availability } = Route.useLoaderData()

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/experts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Experts
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Edit Expert</h1>
        <p className="text-muted-foreground mt-1">Update expert information and availability</p>
      </div>

      <Tabs defaultValue="information" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="information">Expert Information</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="information" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Expert Information</CardTitle>
              <CardDescription>Update basic information about the expert</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpertInfoForm expertId={expertId} initialData={expert} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability Schedule</CardTitle>
              <CardDescription>Manage expert&apos;s weekly availability and blocked dates</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <ExpertAvailabilityForm expertId={expertId} initialData={availability} />
                </div>

                <div className="border rounded-lg p-4 bg-muted/30">
                  <BlockedDatesCalendar
                    expertId={expertId}
                    blockedDates={availability.blockedDates}
                    availabilityDays={availability.days}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <Card>
            <CardContent>
              <ExpertServicesSection expertId={expertId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
