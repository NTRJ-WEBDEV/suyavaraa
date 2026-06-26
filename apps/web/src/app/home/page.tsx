import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { HomeContent } from '@/components/home/HomeContent'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: userProfile }] = await Promise.all([
    supabase.from('users').select('full_name, preferred_mode, is_verified, trust_score').eq('id', user.id).single(),
    supabase.from('user_profiles').select('primary_photo_url').eq('user_id', user.id).single(),
  ])

  return (
    <AppShell
      user={{ name: profile?.full_name ?? null, photo: userProfile?.primary_photo_url ?? null }}
      initialMode={profile?.preferred_mode ?? 'dating'}
    >
      <HomeContent userId={user.id} />
    </AppShell>
  )
}
