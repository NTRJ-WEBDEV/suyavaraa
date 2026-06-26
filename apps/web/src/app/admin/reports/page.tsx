import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { ReportsClient } from '@/components/admin/ReportsClient'
import { hasPermission } from '@/lib/utils/permissions'
import type { Tables } from '@/lib/types/database'

type Report = Pick<Tables<'reports'>, 'id' | 'reporter_id' | 'reported_user_id' | 'category' | 'description' | 'severity' | 'status' | 'created_at'>
type UserName = Pick<Tables<'users'>, 'id' | 'full_name'>

export default async function ReportsPage() {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)

  const { data: reports } = await supabase
    .from('reports')
    .select('id, reporter_id, reported_user_id, category, description, severity, status, created_at')
    .order('created_at', { ascending: false })
    .limit(60) as unknown as { data: Report[] | null }

  const reporterIds = [...new Set((reports ?? []).map((r) => r.reporter_id))]
  const { data: reportersData } = reporterIds.length
    ? await supabase.from('users').select('id, full_name').in('id', reporterIds) as unknown as { data: UserName[] | null }
    : { data: [] as UserName[] }
  const reportersMap = Object.fromEntries((reportersData ?? []).map((u) => [u.id, u]))

  const enriched = (reports ?? []).map((r) => ({
    ...r,
    users: [reportersMap[r.reporter_id] ?? { full_name: null }],
  }))

  return (
    <AdminShell role={admin.role} adminName={admin.adminName}>
      <ReportsClient reports={enriched} adminId={admin.userId} canModerate={hasPermission(admin.role, 'reports:moderate')} />
    </AdminShell>
  )
}
