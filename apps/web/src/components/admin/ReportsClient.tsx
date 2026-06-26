'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateTime, shortId } from '@/lib/utils/format'
import { Flag } from 'lucide-react'

interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  category: string | null
  description: string | null
  severity: string | null
  status: string
  created_at: string
  users: { full_name: string | null }[] | null
}

export function ReportsClient({ reports: initial, adminId, canModerate }: {
  reports: Report[]
  adminId: string
  canModerate: boolean
}) {
  const supabase = createClient()
  const [reports, setReports] = useState(initial)
  const [tab, setTab] = useState('open')
  const [processing, setProcessing] = useState<string | null>(null)

  const resolve = async (id: string, status: 'resolved' | 'dismissed') => {
    setProcessing(id)
    await supabase.from('reports').update({ status, resolved_by: adminId, resolved_at: new Date().toISOString() }).eq('id', id)
    await supabase.from('admin_activity_log').insert({ admin_id: adminId, action: `report_${status}`, target_type: 'report', target_id: id, details: {} })
    setReports((r) => r.map((rep) => rep.id === id ? { ...rep, status } : rep))
    setProcessing(null)
  }

  const filtered = reports.filter((r) => tab === 'all' ? true : r.status === tab)
  const openCount = reports.filter((r) => r.status === 'open').length

  const severityBadge = (s: string | null) => {
    if (s === 'high') return <Badge variant="danger">{s}</Badge>
    if (s === 'medium') return <Badge variant="warning">{s}</Badge>
    return <Badge variant="default">{s ?? 'low'}</Badge>
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-white/40 mt-1">{openCount} open</p>
      </div>

      <div className="mb-4">
        <Tabs
          tabs={[
            { id: 'open', label: 'Open', count: openCount },
            { id: 'resolved', label: 'Resolved' },
            { id: 'dismissed', label: 'Dismissed' },
            { id: 'all', label: 'All', count: reports.length },
          ]}
          active={tab}
          onChange={setTab}
          className="border-white/10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-12">
          <EmptyState icon={<Flag size={40} className="text-white/20" />} title="No reports" className="text-white/50" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white/5 rounded-2xl border border-white/10 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {r.category && <Badge variant="default" className="bg-white/10 text-white/70 border-0 text-[10px] uppercase">{r.category}</Badge>}
                    {severityBadge(r.severity)}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'open' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/40'}`}>{r.status}</span>
                  </div>
                  <p className="text-sm text-white/80">{r.description ?? 'No description'}</p>
                  <div className="text-xs text-white/30 mt-1">
                    Reporter: {r.users?.[0]?.full_name ?? shortId(r.reporter_id)} · Target: {shortId(r.reported_user_id)} · {formatDateTime(r.created_at)}
                  </div>
                </div>
                {canModerate && r.status === 'open' && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" loading={processing === r.id} onClick={() => resolve(r.id, 'dismissed')} className="text-white/50 hover:text-white">Dismiss</Button>
                    <Button size="sm" loading={processing === r.id} onClick={() => resolve(r.id, 'resolved')} className="bg-emerald-600 hover:bg-emerald-700">Resolve</Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
