'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import {
  Home, MessageSquare, User, Bell, Zap, Users, Award, LogOut, Settings,
} from 'lucide-react'
import { useMode } from './ModeProvider'
import { ModeSwitcher } from './ModeSwitcher'
import { Avatar } from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'

interface UserInfo {
  name: string | null
  photo: string | null
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  modes?: ('dating' | 'matrimony')[]
}

const datingNav: NavItem[] = [
  { href: '/home', label: 'Discover', icon: <Home size={18} /> },
  { href: '/dating/tribes', label: 'Tribes', icon: <Users size={18} /> },
  { href: '/dating/impress', label: 'Impress', icon: <Zap size={18} /> },
  { href: '/connections', label: 'Matches', icon: <MessageSquare size={18} /> },
  { href: '/profile', label: 'Profile', icon: <User size={18} /> },
  { href: '/notifications', label: 'Notifications', icon: <Bell size={18} /> },
]

const matrimonyNav: NavItem[] = [
  { href: '/home', label: 'Browse', icon: <Home size={18} /> },
  { href: '/matrimony/zones', label: 'Zones', icon: <Users size={18} /> },
  { href: '/matrimony/suyamvaram', label: 'Suyamvaram', icon: <Award size={18} /> },
  { href: '/connections', label: 'Matches', icon: <MessageSquare size={18} /> },
  { href: '/profile', label: 'Profile', icon: <User size={18} /> },
  { href: '/notifications', label: 'Notifications', icon: <Bell size={18} /> },
]

export function AppSidebar({ user }: { user: UserInfo }) {
  const pathname = usePathname()
  const router = useRouter()
  const { mode } = useMode()
  const navItems = mode === 'matrimony' ? matrimonyNav : datingNav

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col h-full bg-surface border-r border-border/60 w-64 shrink-0">
      <div className="px-5 pt-6 pb-4 border-b border-border/40">
        <Link href="/home">
          <span className="text-xl font-bold text-accent-deep tracking-tight">Suyavaraa</span>
        </Link>
        <div className="mt-4">
          <ModeSwitcher />
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-mode-accent-soft text-mode-accent'
                  : 'text-muted hover:bg-surface-strong hover:text-foreground',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-border/40 pt-4 space-y-1">
        <Link
          href="/profile/premium"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-surface-strong hover:text-foreground transition"
        >
          <Award size={18} className="text-amber-500" />
          Go Premium
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-surface-strong hover:text-foreground transition"
        >
          <Settings size={18} />
          Settings & Help
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut size={18} />
          Sign out
        </button>

        <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-surface-strong">
          <Avatar src={user.photo} name={user.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name ?? 'You'}</p>
            <p className="text-xs text-muted">View profile</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
