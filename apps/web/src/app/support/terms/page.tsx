import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function TermsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const [{ data: profile }, { data: up }] = await Promise.all([
    supabase.from('users').select('full_name, preferred_mode').eq('id', user.id).single(),
    supabase.from('user_profiles').select('primary_photo_url').eq('user_id', user.id).single(),
  ])
  return (
    <AppShell user={{ name: profile?.full_name ?? null, photo: up?.primary_photo_url ?? null }} initialMode={profile?.preferred_mode ?? 'dating'}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/support" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4 transition"><ArrowLeft size={14} />Back</Link>
        <h1 className="text-2xl font-semibold mb-6">Terms of Service</h1>
        <div className="prose prose-sm text-muted max-w-none space-y-4">
          <p>By using Suyavaraa you agree to use it only for genuine dating and matrimony purposes.</p>
          <p>You must be 18 or older to register. You agree to provide truthful information during onboarding.</p>
          <p>Harassment, impersonation, spam, or sharing contact information in chat is prohibited and may result in a ban.</p>
          <p>We reserve the right to remove any content or account that violates our community guidelines.</p>
          <p>Suyavaraa is not liable for outcomes of connections made on the platform. Use your own judgement when meeting matches.</p>
        </div>
      </div>
    </AppShell>
  )
}
