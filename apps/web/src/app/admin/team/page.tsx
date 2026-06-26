import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { Badge } from '@/components/ui/Badge'
import { formatDate, shortId } from '@/lib/utils/format'
import { Shield } from 'lucide-react'
import type { AdminRole, Tables } from '@/lib/types/database'

type TeamMember = Pick<Tables<'admin_users'>, 'user_id' | 'role' | 'is_active' | 'created_at'>
type TeamUser = Pick<Tables<'users'>, 'id' | 'full_name' | 'email'>

export default async function TeamPage() {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase, 'super_admin')

  const { data: team } = await supabase
    .from('admin_users')
    .select('user_id, role, is_active, created_at')
    .order('created_at', { ascending: false }) as unknown as { data: TeamMember[] | null }

  const teamUserIds = (team ?? []).map((t) => t.user_id)
  const { data: teamUsers } = teamUserIds.length
    ? await supabase.from('users').select('id, full_name, email').in('id', teamUserIds) as unknown as { data: TeamUser[] | null }
    : { data: [] as TeamUser[] }
  const usersMap = Object.fromEntries((teamUsers ?? []).map((u) => [u.id, u]))

  const roleBadge = (r: string) => {
    if (r === 'super_admin') return <Badge variant="danger">Super Admin</Badge>
    if (r === 'admin') return <Badge variant="warning">Admin</Badge>
    return <Badge variant="info">Executive</Badge>
  }

  return (
    <AdminShell role={admin.role} adminName={admin.adminName}>
      <div className="px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Team</h1>
          <p className="text-sm text-white/40 mt-1">Read-only. Manage via Supabase dashboard for security.</p>
        </div>
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {team?.map((t) => {
                const u = usersMap[t.user_id]
                return (
                  <tr key={t.user_id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white/90">{u?.full_name ?? 'Unknown'}</p>
                      <p className="text-xs text-white/30">{u?.email ?? shortId(t.user_id)}</p>
                    </td>
                    <td className="px-4 py-3">{roleBadge(t.role)}</td>
                    <td className="px-4 py-3">
                      {t.is_active
                        ? <span className="flex items-center gap-1 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Active</span>
                        : <span className="flex items-center gap-1 text-xs text-white/30"><span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block" />Inactive</span>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-white/30">{formatDate(t.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!team?.length && <p className="text-center text-white/30 py-8">No team members.</p>}
        </div>
        <div className="mt-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <Shield size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300/80">To add or remove admins, use the Supabase dashboard → Table Editor → admin_users.</p>
        </div>
      </div>
    </AdminShell>
  )
}
