import type { LucideIcon } from 'lucide-react'
import { Link, MatchRoute } from '@tanstack/react-router'
import { SidebarMenuButton, SidebarMenuItem } from '../../ui/sidebar'
import { cn } from '../../../lib/utils'

type NavLinkProps = React.ComponentProps<typeof Link> & {
  children: string
  icon: LucideIcon
}

export default function NavLink({ children, icon: Icon, ...linkProps }: NavLinkProps) {
  return (
    <MatchRoute to={linkProps.to} params={linkProps.params}>
      {(match) => {
        return (
          <Link {...linkProps}>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={cn(
                  'border border-transparent transition-colors',
                  match ? 'bg-accent text-accent-foreground border-border' : undefined,
                )}
              >
                <Icon className="size-5" />
                <span>{children}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Link>
        )
      }}
    </MatchRoute>
  )
}
