import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/expert')({
  component: RouteComponent,

  beforeLoad: ({ context: { user } }) => {
    if (user.role !== 'EXPERT') {
      throw redirect({ to: '/' })
    }
  },
})

function RouteComponent() {
  return <Outlet />
}
