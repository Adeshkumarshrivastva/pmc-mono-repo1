import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'
import { Calendar, Clock, TrendingUp, XCircle, UserCheck, DollarSign, ClockFading, ClipboardList } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { honoClient } from '@/lib/hono-client'
import { utcDateToLocalDate } from '@/lib/date'
import dayjs from '@/lib/dayjs'

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
              <p className="text-sm text-muted-foreground mt-1">Overview of your platform metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.totalPatients}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered patients</p>
                </CardContent>
              </Card>

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
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{data.stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Completed payments</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{data.stats.upcomingBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">Scheduled bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{data.stats.completedBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">Finished sessions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Cancelled Bookings</CardTitle>
                    <XCircle className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{data.stats.cancelledBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">Cancelled sessions</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest bookings in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.recentBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No recent bookings</p>
                    </div>
                  ) : (
                    <>
                      {data.recentBookings.slice(0, 10).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-start justify-between space-x-4 p-3 rounded-lg border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{booking.patient.name}</p>
                            <p className="text-xs text-muted-foreground">{booking.service?.name || 'Session'}</p>
                            <p className="text-xs text-muted-foreground">
                              {dayjs(utcDateToLocalDate(dayjs(booking.startDateTime).toDate())).format(
                                'MMM D, YYYY h:mm A',
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                booking.status === 'COMPLETED'
                                  ? 'bg-green-50 text-green-700'
                                  : booking.status === 'CANCELLED'
                                    ? 'bg-red-50 text-red-700'
                                    : booking.status === 'BOOKED'
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {booking.status}
                            </span>
                            <span className="text-xs font-medium text-gray-900">₹{booking.servicePrice}</span>
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <Link
                        to="/expert/bookings"
                        className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                      >
                        View All Bookings
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Patients</CardTitle>
                  <CardDescription>Newly registered patients</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.recentPatients.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No recent patients</p>
                    </div>
                  ) : (
                    <>
                      {data.recentPatients.map((patient) => (
                        <div key={patient.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                          <div className="flex-shrink-0">
                            {patient.user.image ? (
                              <img src={patient.user.image} alt={patient.name} className="h-10 w-10 rounded-full" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">{patient.phoneNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined{' '}
                              {dayjs(utcDateToLocalDate(dayjs(patient.createdAt).toDate())).format('MMM D, YYYY')}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <Link
                        to="/admin/patients"
                        className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                      >
                        View All Patients
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage platform resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/expert/availability"
                    className="inline-flex h-auto py-4 flex-col items-start rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4"
                  >
                    <ClockFading className="h-5 w-5 mb-2" />
                    <span className="font-semibold">Update Availability</span>
                    <span className="text-xs text-muted-foreground">Update your availability schedule</span>
                  </Link>
                  <Link
                    to="/expert/bookings"
                    className="inline-flex h-auto py-4 flex-col items-start rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4"
                  >
                    <Calendar className="h-5 w-5 mb-2" />
                    <span className="font-semibold">Manage Bookings</span>
                    <span className="text-xs text-muted-foreground">View all bookings</span>
                  </Link>
                  <Link
                    to="/expert/services"
                    className="inline-flex h-auto py-4 flex-col items-start rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4"
                  >
                    <ClipboardList className="h-5 w-5 mb-2" />
                    <span className="font-semibold">Manage Services</span>
                    <span className="text-xs text-muted-foreground">Manage provided services</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        ))
        .otherwise(() => null)}
    </div>
  )
}

async function fetchDashboard() {
  const response = await honoClient.server.experts.dashboard.$get()

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard')
  }

  const data = await response.json()

  return {
    stats: data.stats,
    recentBookings: data.recentBookings || [],
    recentPatients: data.recentPatients || [],
  }
}
