import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { fetchHomeData, HOME_QUERY } from './-queries/home'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

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

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.phoneNumber.sendOtp({
        phoneNumber: '+918076332196',
      })

      if (res.error) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: (data) => {
      console.log('Login successful', data)
      // Handle successful login, e.g., redirect or show a success message
    },
    onError: (error) => {
      console.error('Login failed:', error)
    },
  })

  return (
    <div className="flex flex-col font-extralight bg-red-400">
      Hello "/"! {message}
      <Button className="bg-blue-500 text-white">Click Me</Button>
      <Button
        onClick={() => {
          loginMutation.mutate()
        }}
      >
        Send Otp
      </Button>
    </div>
  )
}
