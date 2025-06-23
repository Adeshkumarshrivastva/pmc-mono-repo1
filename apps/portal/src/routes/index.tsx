import { createFileRoute } from '@tanstack/react-router'
import { fetchHomeData, HOME_QUERY } from './-queries/home'

export const Route = createFileRoute('/')({
  loader: async ({ context: { queryClient } }) => {
    const output = queryClient.ensureQueryData({
      queryKey: HOME_QUERY,
      queryFn: fetchHomeData,
    })
    return output
  },
  component: Home,
})

function Home() {
  const { message } = Route.useLoaderData()
  return <div>Hello "/"! {message}</div>
}
