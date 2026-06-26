'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateTime, shortId } from '@/lib/utils/format'
import { ShieldCheck, CheckCircle, X, ExternalLink } from 'lucide-react'

interface VerificationRow {
  id: string
  user_id: string
  status: string
  request_type: string
  selfie_url: string | null
  id_card_url: string | null
  created_at: string
  users: { full_name: string | null; email: string | null }[] | null
}

export function VerificationsClient({ queue: initial, adminId, canReview }: {
  queue: VerificationRow[]
  adminId: string
  canReview: boolean
}) {
  const supabase = createClient()
  const [queue, setQueue] = useState(initial)
  const [processing, setProcessing] = useState<string | null>(null)

  const process = async (id: string, approved: boolean) => {
    setProcessing(id)
    const row = queue.find((r) => r.id === id)
    if (!row) return

    const newStatus = approved ? 'verified' : 'rejected'

    await supabase.from('verification_requests').update({
      status: newStatus,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)

    if (approved) {
      await supabase.from('users').update({
        is_verified: true,
        verification_status: 'verified',
        selfie_verified_at: new Date().toISOString(),
        trust_score: 80,
        trust_level: 'verified',
      }).eq('id', row.user_id)
    } else {
      await supabase.from('users').update({ verification_status: 'rejected' }).eq('id', row.user_id)
    }

    await supabase.from('admin_activity_log').insert({
      admin_id: adminId,
      action: approved ? 'approved_verification' : 'rejected_verification',
      target_type: 'verification_request',
      target_id: id,
      details: { user_id: row.user_id },
    })

    setQueue((q) => q.filter((r) => r.id !== id))
    setProcessing(null)
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Verification Queue</h1>
        <p className="text-sm text-white/40 mt-1">{queue.length} pending</p>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-12">
          <EmptyState icon={<ShieldCheck size={40} className="text-white/20" />} title="Queue is clear" subtitle="No pending verifications." className="text-white/50" />
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((row) => {
            const user = row.users?.[0]
            return (
              <div key={row.id} className="bg-white/5 rounded-2xl border border-white/10 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-white">{user?.full_name ?? 'Unknown'}</p>
                    <p className="text-xs text-white/40">{user?.email ?? shortId(row.user_id)}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="info" className="bg-blue-500/20 text-blue-300 border-0 text-[10px]">{row.request_type}</Badge>
                      <span className="text-xs text-white/30">{formatDateTime(row.created_at)}</span>
                    </div>
                  </div>
                  {canReview && (
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={processing === row.id}
                        onClick={() => process(row.id, false)}
                      >
                        <X size={14} />Reject
                      </Button>
                      <Button
                        size="sm"
                        loading={processing === row.id}
                        onClick={() => process(row.id, true)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle size={14} />Approve
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-4 flex-wrap">
                  {row.selfie_url && (
                    <a href={row.selfie_url} target="_blank" rel="noreferrer" className="group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={row.selfie_url} alt="selfie" className="h-32 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-white/30 transition" />
                      <div className="flex items-center gap-1 text-[10px] text-white/40 mt-1"><ExternalLink size={9} />Selfie</div>
                    </a>
                  )}
                  {row.id_card_url && (
                    <a href={row.id_card_url} target="_blank" rel="noreferrer" className="group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={row.id_card_url} alt="id card" className="h-32 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-white/30 transition" />
                      <div className="flex items-center gap-1 text-[10px] text-white/40 mt-1"><ExternalLink size={9} />ID Card</div>
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
