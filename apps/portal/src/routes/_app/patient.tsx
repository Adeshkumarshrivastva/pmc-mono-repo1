import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/patient')({
  component: RouteComponent,
  beforeLoad: ({ context: { user } }) => {
    if (user.role !== 'PATIENT') {
      throw redirect({ to: '/' })
    }
  },
})

function RouteComponent() {
  return <Outlet />
}
