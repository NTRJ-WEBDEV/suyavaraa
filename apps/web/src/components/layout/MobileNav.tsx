'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { Home, MessageSquare, User, Zap, Users, Award } from 'lucide-react'
import { useMode } from './ModeProvider'

const datingNav = [
  { href: '/home', label: 'Home', icon: <Home size={20} /> },
  { href: '/dating/tribes', label: 'Tribes', icon: <Users size={20} /> },
  { href: '/dating/impress', label: 'Impress', icon: <Zap size={20} /> },
  { href: '/connections', label: 'Matches', icon: <MessageSquare size={20} /> },
  { href: '/profile', label: 'Profile', icon: <User size={20} /> },
]

const matrimonyNav = [
  { href: '/home', label: 'Home', icon: <Home size={20} /> },
  { href: '/matrimony/zones', label: 'Zones', icon: <Users size={20} /> },
  { href: '/matrimony/suyamvaram', label: 'Suyamvaram', icon: <Award size={20} /> },
  { href: '/connections', label: 'Matches', icon: <MessageSquare size={20} /> },
  { href: '/profile', label: 'Profile', icon: <User size={20} /> },
]

export function MobileNav() {
  const pathname = usePathname()
  const { mode } = useMode()
  const items = mode === 'matrimony' ? matrimonyNav : datingNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border/60 flex lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-semibold transition',
              active ? 'text-mode-accent' : 'text-muted',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
