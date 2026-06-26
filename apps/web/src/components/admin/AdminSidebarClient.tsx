'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export function AdminSidebarClient({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        active
          ? 'bg-white/10 text-white'
          : 'text-white/50 hover:bg-white/5 hover:text-white/80',
      )}
    >
      {label}
    </Link>
  )
}
