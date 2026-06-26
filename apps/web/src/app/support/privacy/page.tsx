import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PrivacyPage() {
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
        <h1 className="text-2xl font-semibold mb-6">Privacy Policy</h1>
        <div className="prose prose-sm text-muted max-w-none space-y-4">
          <p>Suyavaraa collects your name, email, phone number, date of birth, photos, and profile details to provide matchmaking services.</p>
          <p>We use your data to match you with compatible profiles, verify your identity, and keep the platform safe.</p>
          <p>We do not sell your personal data. We share data only with Supabase (our backend provider) and, where required, with law enforcement.</p>
          <p>You may request deletion of your account and data by contacting support.</p>
          <p>Photos and verification media are stored securely and accessible only to admins for review.</p>
        </div>
      </div>
    </AppShell>
  )
}
