import { createFileRoute } from '@tanstack/react-router'
import { fetchHomeData, HOME_QUERY } from './-queries/home'
import { Button } from '@/components/ui/button'

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
  return (
    <div className="flex flex-col bg-red-400">
      Hello "/"! {message}
      <Button className="bg-blue-500 text-white">Click Me</Button>
    </div>
  )
}
