import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { MemberProfileView } from '@/components/profile/MemberProfileView'

export default async function MemberProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: targetId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: me }, { data: meUp }, { data: target }, { data: targetUp }] = await Promise.all([
    supabase.from('users').select('full_name, preferred_mode').eq('id', user.id).single(),
    supabase.from('user_profiles').select('primary_photo_url').eq('user_id', user.id).single(),
    supabase.from('users').select('id, full_name, date_of_birth, gender, city, bio, is_verified, trust_score, trust_level').eq('id', targetId).single(),
    supabase.from('user_profiles').select('*').eq('user_id', targetId).single(),
  ])

  if (!target) notFound()

  const { data: existingAction } = await supabase
    .from('user_actions')
    .select('action_type')
    .eq('actor_user_id', user.id)
    .eq('target_user_id', targetId)
    .single()

  return (
    <AppShell user={{ name: me?.full_name ?? null, photo: meUp?.primary_photo_url ?? null }} initialMode={me?.preferred_mode ?? 'dating'}>
      <MemberProfileView
        profile={target}
        userProfile={targetUp}
        viewerId={user.id}
        existingAction={existingAction?.action_type ?? null}
      />
    </AppShell>
  )
}
