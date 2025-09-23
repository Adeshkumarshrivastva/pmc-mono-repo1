import { CalendarDaysIcon, HomeIcon, LayoutDashboardIcon, UserIcon, type LucideIcon } from 'lucide-react'
import { Link, useNavigate, type ToPathOption } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UserRole } from '@pmc/server/src/generated/prisma/client'
import { Logo } from '../ui/logo'
import { authClient, type AuthClient } from '@/lib/auth-client'
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
} from '../ui/sidebar'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'

import { getErrorMessage } from '@/lib/utils'
import NavLink from './components/nav-link'
import { queryClient } from '@/lib/query-client'

type AppShellProps = {
  children: React.ReactNode
  user: AuthClient['$Infer']['Session']['user']
}

export default function AppShell({ children, user }: AppShellProps) {
  const navigate = useNavigate()
  const signOutMutation = useMutation({
    mutationFn: () => {
      return authClient.signOut()
    },
    onSuccess: () => {
      toast.success('Signed out successfully')
      queryClient.clear()
      navigate({ to: '/login', replace: true })
    },
    onError: (error) => {
      toast.error('Failed to sign out', {
        description: getErrorMessage(error),
      })
    },
  })

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link to="/" className="flex items-center gap-4 h-12">
            <Logo className="size-12" />
            <div className="text-xl font-medium tracking-tight">Positive Mind Care</div>
          </Link>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col space-y-1">
                {APP_SHELL_ITEMS.filter((item) => item.availableForUserRoles.includes(user?.role)).map((item) => (
                  <NavLink to={item.path} icon={item.icon}>
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </Sidebar>
      <SidebarInset className="relative">
        <div className="bg-background sticky top-0 z-50 flex items-center gap-4 border-b px-3 py-1.5">
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" icon={signOutMutation.isPending ? <Spinner /> : <UserIcon />} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem disabled>
                <div>
                  <div>{user.name}</div>
                  <div className="text-muted-foreground text-xs">{user.email}</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOutMutation.mutate()
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

type AppShellItem = {
  type: 'link'
  icon: LucideIcon
  path: ToPathOption
  name: string
  availableForUserRoles: UserRole[]
}

const APP_SHELL_ITEMS: AppShellItem[] = [
  {
    type: 'link',
    icon: HomeIcon,
    name: 'Home',
    path: '/expert/dashboard',
    availableForUserRoles: ['EXPERT'],
  },
  {
    type: 'link',
    icon: CalendarDaysIcon,
    name: 'Bookings',
    path: '/expert/bookings',
    availableForUserRoles: ['EXPERT'],
  },
  {
    type: 'link',
    icon: LayoutDashboardIcon,
    name: 'Home',
    path: '/patient/dashboard',
    availableForUserRoles: ['PATIENT'],
  },
  {
    type: 'link',
    icon: CalendarDaysIcon,
    name: 'My Bookings',
    path: '/patient/bookings',
    availableForUserRoles: ['PATIENT'],
  },
  {
    type: 'link',
    icon: UserIcon,
    name: 'Profile',
    path: '/patient/profile',
    availableForUserRoles: ['PATIENT'],
  },
]
