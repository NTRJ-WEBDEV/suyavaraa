import { AppSidebar } from './AppSidebar'
import { MobileNav } from './MobileNav'
import { ModeProvider } from './ModeProvider'
import type { AppMode } from '@/lib/types/database'

interface AppShellProps {
  children: React.ReactNode
  user: { name: string | null; photo: string | null }
  initialMode?: AppMode | null
}

export function AppShell({ children, user, initialMode }: AppShellProps) {
  return (
    <ModeProvider initialMode={initialMode}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-col h-full">
          <AppSidebar user={user} />
        </div>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>
        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </ModeProvider>
  )
}
