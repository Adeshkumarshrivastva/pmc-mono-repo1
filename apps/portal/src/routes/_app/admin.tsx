import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin')({
  component: RouteComponent,
  beforeLoad: ({ context: { user } }) => {
    if (user.role !== 'ADMIN') {
      throw redirect({ to: '/' })
    }
  },
})

function RouteComponent() {
  return <Outlet />
}
