import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/link'
import { Shield, FileText, LogOut, Star, ChevronRight } from 'lucide-react'

const links = [
  { href: '/support/privacy', label: 'Privacy Policy', icon: <Shield size={18} /> },
  { href: '/support/terms', label: 'Terms of Service', icon: <FileText size={18} /> },
  { href: '/profile/premium', label: 'Upgrade to Premium', icon: <Star size={18} className="text-amber-500" /> },
]

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: up }] = await Promise.all([
    supabase.from('users').select('full_name, preferred_mode').eq('id', user.id).single(),
    supabase.from('user_profiles').select('primary_photo_url').eq('user_id', user.id).single(),
  ])

  return (
    <AppShell user={{ name: profile?.full_name ?? null, photo: up?.primary_photo_url ?? null }} initialMode={profile?.preferred_mode ?? 'dating'}>
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">Settings & Help</h1>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm divide-y divide-border">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 px-5 py-4 hover:bg-surface-strong transition">
              <span className="text-muted">{l.icon}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{l.label}</span>
              <ChevronRight size={16} className="text-muted" />
            </Link>
          ))}
          <div className="px-5 py-4 flex items-center gap-3 text-sm text-muted">
            <LogOut size={18} />
            <span>Sign out is available in the sidebar</span>
          </div>
        </div>
        <p className="text-xs text-muted text-center mt-6">Suyavaraa v1.0 · suyavaraa.in</p>
      </div>
    </AppShell>
  )
}
