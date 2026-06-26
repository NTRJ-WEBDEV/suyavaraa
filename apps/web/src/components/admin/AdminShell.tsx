import Link from 'next/link'
import type { AdminRole } from '@/lib/types/database'
import { getAdminNavItems } from '@/lib/utils/permissions'
import { AdminSidebarClient } from './AdminSidebarClient'

interface AdminShellProps {
  children: React.ReactNode
  role: AdminRole
  adminName: string | null
}

export function AdminShell({ children, role, adminName }: AdminShellProps) {
  const navItems = getAdminNavItems(role)
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0906]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-[#140b06] border-r border-white/10">
        <div className="px-5 pt-6 pb-4 border-b border-white/10">
          <Link href="/home" className="text-sm text-white/40 hover:text-white/70 transition block mb-1">← Back to app</Link>
          <p className="text-lg font-bold text-white tracking-tight">Admin</p>
          <p className="text-xs text-white/40 mt-1 capitalize">{role.replace('_', ' ')}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <AdminSidebarClient key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <div className="px-5 pb-5 border-t border-white/10 pt-4">
          <p className="text-xs text-white/40 truncate">{adminName ?? 'Admin'}</p>
        </div>
      </aside>
      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-[#0f0906] text-white">
        {children}
      </main>
    </div>
  )
}
