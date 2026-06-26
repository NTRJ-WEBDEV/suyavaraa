import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { formatDateTime, shortId } from '@/lib/utils/format'
import type { Tables } from '@/lib/types/database'

type ActivityLog = Pick<Tables<'admin_activity_log'>, 'id' | 'admin_id' | 'action' | 'target_type' | 'target_id' | 'created_at'>

export default async function ActivityPage() {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)

  const { data: logs } = await supabase
    .from('admin_activity_log')
    .select('id, admin_id, action, target_type, target_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100) as { data: ActivityLog[] | null }

  return (
    <AdminShell role={admin.role} adminName={admin.adminName}>
      <div className="px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Activity Log</h1>
        <p className="text-sm text-white/40 mb-6">Audit trail of all admin actions</p>
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          {logs?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Admin</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Target</th>
                  <th className="text-left px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-white/60 font-mono text-xs">{shortId(log.admin_id)}</td>
                    <td className="px-4 py-3 text-white/80 font-medium">{log.action.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-white/40">
                      {log.target_type && <span className="capitalize">{log.target_type}</span>}
                      {log.target_id && <span className="font-mono ml-1 text-white/20">{shortId(log.target_id)}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/30">{formatDateTime(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-white/30 text-sm py-12">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
