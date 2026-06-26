'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Award, Users, Calendar, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

interface Challenge {
  id: string
  title: string
  description: string | null
  challenge_type: string | null
  deadline: string | null
  max_participants: number | null
  application_count: number
}

export function SuyamvaramList({ challenges, userId }: { challenges: Challenge[]; userId: string }) {
  const supabase = createClient()
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [applying, setApplying] = useState<string | null>(null)

  const apply = async (challengeId: string) => {
    setApplying(challengeId)
    await supabase.from('suyamvaram_applications').insert({
      challenge_id: challengeId,
      applicant_id: userId,
      status: 'pending',
    })
    setAppliedIds((s) => new Set([...s, challengeId]))
    setApplying(null)
  }

  if (!challenges.length) {
    return <EmptyState icon={<Award size={40} />} title="No Suyamvaram events yet" subtitle="Be the first to create one!" action={<Link href="/matrimony/suyamvaram/create"><Button variant="mode">Create event</Button></Link>} className="p-12" />
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Suyamvaram</h1>
          <p className="text-sm text-muted">Formal matrimony events — apply and get selected</p>
        </div>
        <Link href="/matrimony/suyamvaram/create">
          <Button variant="mode" size="sm"><Plus size={16} />Create</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {challenges.map((c) => {
          const applied = appliedIds.has(c.id)
          const full = c.max_participants !== null && c.application_count >= c.max_participants
          return (
            <div key={c.id} className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    {c.challenge_type && <Badge variant="mode">{c.challenge_type}</Badge>}
                    {full && <Badge variant="warning">Full</Badge>}
                  </div>
                  {c.description && <p className="text-sm text-muted line-clamp-2 mb-3">{c.description}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    {c.deadline && (
                      <span className="flex items-center gap-1"><Calendar size={11} />Deadline: {formatDate(c.deadline)}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={11} />{c.application_count}{c.max_participants ? `/${c.max_participants}` : ''} applied
                    </span>
                  </div>
                </div>
                <Button
                  variant={applied ? 'secondary' : 'mode'}
                  size="sm"
                  disabled={applied || full || applying === c.id}
                  loading={applying === c.id}
                  onClick={() => apply(c.id)}
                  className="shrink-0"
                >
                  {applied ? 'Applied ✓' : 'Apply'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
