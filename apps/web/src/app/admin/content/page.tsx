import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { formatDateTime, shortId } from '@/lib/utils/format'
import { Badge } from '@/components/ui/Badge'
import type { Tables } from '@/lib/types/database'

type Removal = Pick<Tables<'content_auto_removals'>, 'id' | 'user_id' | 'content_type' | 'reason' | 'removed_at'>
type Scan = Pick<Tables<'deepfake_scans'>, 'id' | 'user_id' | 'media_url' | 'scan_result' | 'confidence_score' | 'is_deepfake' | 'flagged_at'>

export default async function ContentPage() {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)

  const { data: removals } = await supabase.from('content_auto_removals').select('id, user_id, content_type, reason, removed_at').order('removed_at', { ascending: false }).limit(50) as unknown as { data: Removal[] | null }
  const { data: scans } = await supabase.from('deepfake_scans').select('id, user_id, media_url, scan_result, confidence_score, is_deepfake, flagged_at').order('created_at', { ascending: false }).limit(50) as unknown as { data: Scan[] | null }

  return (
    <AdminShell role={admin.role} adminName={admin.adminName}>
      <div className="px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Content</h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Deepfake Scans ({scans?.length ?? 0})</h2>
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              {scans?.length ? (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                    <th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Result</th><th className="text-left px-4 py-3">Confidence</th><th className="text-left px-4 py-3">Flagged</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {scans.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white/70 font-mono text-xs">{shortId(s.user_id)}</td>
                        <td className="px-4 py-3">{s.is_deepfake ? <Badge variant="danger">Deepfake</Badge> : <Badge variant="success">Clean</Badge>}</td>
                        <td className="px-4 py-3 text-white/40">{s.confidence_score !== null ? `${Math.round(s.confidence_score * 100)}%` : '—'}</td>
                        <td className="px-4 py-3 text-xs text-white/30">{s.flagged_at ? formatDateTime(s.flagged_at) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-center text-white/30 text-sm py-8">No scans yet.</p>}
            </div>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Auto Removals ({removals?.length ?? 0})</h2>
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              {removals?.length ? (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                    <th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Reason</th><th className="text-left px-4 py-3">Removed</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {removals.map((r) => (
                      <tr key={r.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white/70 font-mono text-xs">{shortId(r.user_id)}</td>
                        <td className="px-4 py-3"><Badge variant="warning" className="text-[10px]">{r.content_type}</Badge></td>
                        <td className="px-4 py-3 text-white/50 text-xs">{r.reason ?? '—'}</td>
                        <td className="px-4 py-3 text-xs text-white/30">{formatDateTime(r.removed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-center text-white/30 text-sm py-8">No auto-removals.</p>}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  )
}
