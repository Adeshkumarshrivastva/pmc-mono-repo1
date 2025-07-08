import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { CallIcon } from '@/components/ui/icons'
import { NAVBAR_HEIGHT } from '@/lib/constants'

export default function AppShell({ children }: React.PropsWithChildren) {
  return (
    <div>
      <div
        className="sticky top-0 z-50 flex items-center bg-primary text-primary-foreground px-4 py-2"
        style={{ height: NAVBAR_HEIGHT }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-16" />
          <div>
            <div className="text-2xl font-semibold">Positive</div>
            <div className="text-base">Mind Care</div>
          </div>
        </Link>
        <div className="flex-1 flex justify-center items-center space-x-10">
          <Link href="/" className="text-lg font-semibold">
            Home
          </Link>
          <Link href="/deep-tms" className="text-lg font-semibold text-muted-foreground">
            Deep TMS
          </Link>
          <Link href="/contact" className="text-lg font-semibold text-muted-foreground">
            Contact
          </Link>
        </div>
        <Button variant="secondary" icon={<CallIcon />}>
          Book Free Consultation
        </Button>
      </div>
      {children}
    </div>
  )
}
