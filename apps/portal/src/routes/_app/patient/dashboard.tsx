import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'
import { Calendar, Clock, TrendingUp, User } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { honoClient } from '@/lib/hono-client'
import { utcDateToLocalDate } from '@/lib/date'
import dayjs from '@/lib/dayjs'

export const Route = createFileRoute('/_app/patient/dashboard')({
  component: PatientDashboard,
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

function PatientDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ['patient-dashboard'],
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
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {data.patient.name}!</h1>
              <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your appointments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.upcomingBookingsCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Scheduled appointments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.completedBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">Sessions completed</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your next scheduled sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.upcomingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                      <Link
                        to="/experts"
                        className="inline-flex items-center justify-center text-sm font-medium text-primary underline-offset-4 hover:underline mt-2"
                      >
                        Browse Experts
                      </Link>
                    </div>
                  ) : (
                    <>
                      {data.upcomingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-start space-x-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {booking.expert.user.image ? (
                              <img
                                src={booking.expert.user.image}
                                alt={booking.expert.name}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{booking.expert.name}</p>
                            <p className="text-xs text-muted-foreground">{booking.serviceName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {dayjs(utcDateToLocalDate(dayjs(booking.startDateTime).toDate())).format('MMM D, YYYY')}{' '}
                              at {dayjs(utcDateToLocalDate(dayjs(booking.startDateTime).toDate())).format('h:mm A')}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {data.stats.upcomingBookingsCount > 3 && (
                        <Link
                          to="/patient/bookings"
                          className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          View All Bookings
                        </Link>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest booking history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.recentBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  ) : (
                    <>
                      {data.recentBookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-start justify-between space-x-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {booking.expert.user.image ? (
                                <img
                                  src={booking.expert.user.image}
                                  alt={booking.expert.name}
                                  className="h-8 w-8 rounded-full"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{booking.expert.name}</p>
                              <p className="text-xs text-muted-foreground">{booking.serviceName}</p>
                              <p className="text-xs text-muted-foreground">
                                {dayjs(utcDateToLocalDate(dayjs(booking.createdAt).toDate())).format('MMM D, YYYY')}
                              </p>
                            </div>
                          </div>
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
                        </div>
                      ))}
                      {data.recentBookings.length > 5 && (
                        <>
                          <Separator />
                          <Link
                            to="/patient/bookings"
                            className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                          >
                            View All Activity
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account and bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/experts"
                    className="inline-flex h-auto py-4 flex-col items-start rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4"
                  >
                    <Calendar className="h-5 w-5 mb-2" />
                    <span className="font-semibold">Book Appointment</span>
                    <span className="text-xs text-muted-foreground">Find and book an expert</span>
                  </Link>
                  <Link
                    to="/patient/bookings"
                    className="inline-flex h-auto py-4 flex-col items-start rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4"
                  >
                    <Clock className="h-5 w-5 mb-2" />
                    <span className="font-semibold">My Bookings</span>
                    <span className="text-xs text-muted-foreground">View all appointments</span>
                  </Link>
                  <Link
                    to="/patient/profile"
                    className="inline-flex h-auto py-4 flex-col items-start rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4"
                  >
                    <User className="h-5 w-5 mb-2" />
                    <span className="font-semibold">My Profile</span>
                    <span className="text-xs text-muted-foreground">Update your information</span>
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
  const response = await honoClient.server.patient.dashboard.$get()

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard')
  }

  return response.json()
}
