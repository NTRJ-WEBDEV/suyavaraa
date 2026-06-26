import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { SuyamvaramList } from '@/components/suyamvaram/SuyamvaramList'

export default async function SuyamvaramPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: up }, { data: challenges }] = await Promise.all([
    supabase.from('users').select('full_name, preferred_mode').eq('id', user.id).single(),
    supabase.from('user_profiles').select('primary_photo_url').eq('user_id', user.id).single(),
    supabase.from('suyamvaram_challenges').select('id, title, description, challenge_type, deadline, max_participants, application_count').eq('is_active', true).order('created_at', { ascending: false }),
  ])

  return (
    <AppShell user={{ name: profile?.full_name ?? null, photo: up?.primary_photo_url ?? null }} initialMode="matrimony">
      <SuyamvaramList challenges={challenges ?? []} userId={user.id} />
    </AppShell>
  )
}
