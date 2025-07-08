'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { CallIcon } from '@/components/ui/icons'
import { NAVBAR_HEIGHT } from '@/lib/constants'

export default function Navbar() {
    const pathname = usePathname()

    return (
        <header
            className="sticky top-0 z-50 bg-primary text-primary-foreground"
            style={{ height: NAVBAR_HEIGHT }}
        >
            <nav className="flex items-center justify-between h-full px-4 py-2">
                <Link
                    href="/"
                    className="flex items-center gap-2"
                >
                    <Logo className="size-16" />
                    <div className="text-left">
                        <div className="text-2xl font-semibold leading-tight">Positive</div>
                        <div className="text-base leading-tight">Mind Care</div>
                    </div>
                </Link>

                <div className="flex-1 hidden md:flex items-center justify-center space-x-8">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-lg font-semibold transition-colors hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50 rounded-md px-2 py-1 ${isActive
                                    ? 'text-primary-foreground'
                                    : 'text-primary-foreground/50 hover:text-primary-foreground'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                <Button
                    variant="secondary"
                    icon={<CallIcon />}
                >
                    Book Free Consultation
                </Button>
            </nav>
        </header>
    )
}

const navItems = [
    { href: '/', label: 'Home' },
    { href: '/deep-tms', label: 'Deep TMS' },
    { href: '/contact', label: 'Contact' }
]
