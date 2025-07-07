import { Logo } from '@/components/ui/logo'
import Link from 'next/link'

export default function AppShell({}: React.PropsWithChildren) {
  return (
    <div>
      <div className="bg-primary text-primary-foreground px-4 py-2">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-16" />
          <div>
            <div className="text-2xl font-semibold">Positive</div>
            <div className="text-base">Mind Care</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
