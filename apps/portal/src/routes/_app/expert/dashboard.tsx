import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'
import { Calendar, Clock, TrendingUp, XCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { honoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_app/expert/dashboard')({
  component: ExpertDashboard,
  loader: ({ context: { user } }) => {
    return { user }
  },

  pendingComponent: () => (
    <div className="flex h-screen w-full items-center justify-center gap-2">
      <Spinner />
      <div className="text-muted-foreground text-xs font-medium">Loading...</div>
    </div>
  ),
})

function ExpertDashboard() {
  const { user } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const dashboardQuery = useQuery({
    queryKey: ['expert-dashboard'],
    queryFn: fetchDashboard,
  })

  return (
    <div className="h-full w-full flex flex-col space-y-6">
      {match(dashboardQuery)
        .returnType<React.ReactNode>()
        .with({ status: 'error' }, () => (
          <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border">
            <p className="text-lg font-medium">Failed to load dashboard</p>
            <p className="text-sm text-muted-foreground">Please try again later</p>
          </div>
        ))
        .with({ status: 'pending' }, () => (
          <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border">
            <Spinner />
            <div className="text-muted-foreground text-xs font-medium">Loading dashboard...</div>
          </div>
        ))
        .with({ status: 'success' }, ({ data }) => (
          <>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground mt-1">Overview of your platform metrics</span>
                <div className="flex justify-end items-center">
                  <Button onClick={() => navigate({ to: '/expert/bookings' })}>View Bookings</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.upcomingBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">Scheduled bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.completedBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">Finished sessions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Cancelled Bookings</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.cancelledBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">Cancelled sessions</p>
                </CardContent>
              </Card>
            </div>
          </>
        ))
        .otherwise(() => null)}
    </div>
  )
}

async function fetchDashboard() {
  const response = await honoClient.server.experts.dashboard.$get()
  if (!response.ok) {
    throw new Error('Failed to fetch expert dashboard')
  }
  return response.json()
}
