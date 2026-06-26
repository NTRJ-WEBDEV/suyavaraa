import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { ImpressFeed } from '@/components/impress/ImpressFeed'

export default async function ImpressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: up }] = await Promise.all([
    supabase.from('users').select('full_name, preferred_mode').eq('id', user.id).single(),
    supabase.from('user_profiles').select('primary_photo_url').eq('user_id', user.id).single(),
  ])

  return (
    <AppShell user={{ name: profile?.full_name ?? null, photo: up?.primary_photo_url ?? null }} initialMode={profile?.preferred_mode ?? 'dating'}>
      <ImpressFeed userId={user.id} />
    </AppShell>
  )
}
