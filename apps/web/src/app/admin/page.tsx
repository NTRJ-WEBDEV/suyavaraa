import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { shortId, formatDateTime } from '@/lib/utils/format'
import { Users, ShieldCheck, Flag, Activity } from 'lucide-react'
import type { Tables } from '@/lib/types/database'

type ActivityLog = Pick<Tables<'admin_activity_log'>, 'id' | 'action' | 'target_type' | 'created_at' | 'admin_id'>

interface StatCardProps { label: string; value: number | string; icon: React.ReactNode; color: string }
function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-2xl border border-white/10 p-5 ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/60">{label}</span>
        <span className="text-white/40">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)

  const [
    { count: totalUsers },
    { count: pendingVerifications },
    { count: openReports },
    { count: bannedUsers },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_banned', true),
  ])

  const { data: activityLog } = await supabase
    .from('admin_activity_log')
    .select('id, action, target_type, created_at, admin_id')
    .order('created_at', { ascending: false })
    .limit(10) as unknown as { data: ActivityLog[] | null }

  return (
    <AdminShell role={admin.role} adminName={admin.adminName}>
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Suyavaraa Admin Console · <span className="capitalize">{admin.role.replace('_', ' ')}</span></p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={totalUsers ?? 0} icon={<Users size={18} />} color="bg-white/5" />
          <StatCard label="Pending Verifications" value={pendingVerifications ?? 0} icon={<ShieldCheck size={18} />} color="bg-amber-500/10 border-amber-500/20" />
          <StatCard label="Open Reports" value={openReports ?? 0} icon={<Flag size={18} />} color="bg-red-500/10 border-red-500/20" />
          <StatCard label="Banned Users" value={bannedUsers ?? 0} icon={<Activity size={18} />} color="bg-white/5" />
        </div>
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white/70 mb-4">Recent Activity</h2>
          {activityLog?.length ? (
            <div className="space-y-3">
              {activityLog.map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
                  <span className="text-white/70 flex-1">
                    <span className="text-white/90 font-medium">{shortId(log.admin_id)}</span> {log.action}
                    {log.target_type && <span className="text-white/40"> · {log.target_type}</span>}
                  </span>
                  <span className="text-white/30 text-xs shrink-0">{formatDateTime(log.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/30">No activity yet.</p>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
