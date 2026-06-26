import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { VerificationsClient } from '@/components/admin/VerificationsClient'
import { hasPermission } from '@/lib/utils/permissions'
import type { Tables } from '@/lib/types/database'

type VerifRequest = Pick<Tables<'verification_requests'>, 'id' | 'user_id' | 'status' | 'request_type' | 'selfie_url' | 'id_card_url' | 'created_at'>
type UserBasic = Pick<Tables<'users'>, 'id' | 'full_name' | 'email'>

export default async function VerificationsPage() {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)

  const { data: queue } = await supabase
    .from('verification_requests')
    .select('id, user_id, status, request_type, selfie_url, id_card_url, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50) as unknown as { data: VerifRequest[] | null }

  const userIds = [...new Set((queue ?? []).map((r) => r.user_id))]
  const { data: usersData } = userIds.length
    ? await supabase.from('users').select('id, full_name, email').in('id', userIds) as unknown as { data: UserBasic[] | null }
    : { data: [] as UserBasic[] }

  const usersMap = Object.fromEntries((usersData ?? []).map((u) => [u.id, u]))
  const enriched = (queue ?? []).map((r) => ({
    ...r,
    users: [usersMap[r.user_id] ?? { full_name: null, email: null }],
  }))

  return (
    <AdminShell role={admin.role} adminName={admin.adminName}>
      <VerificationsClient queue={enriched} adminId={admin.userId} canReview={hasPermission(admin.role, 'verifications:review')} />
    </AdminShell>
  )
}
