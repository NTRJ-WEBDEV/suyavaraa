'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users, Plus, Check } from 'lucide-react'

interface Tribe {
  id: string
  name: string
  description: string | null
  cover_image_url: string | null
  member_count: number
  category: string | null
}

interface TribesGridProps {
  tribes: Tribe[]
  userId: string
  mode: 'dating' | 'matrimony'
}

export function TribesGrid({ tribes, userId, mode }: TribesGridProps) {
  const supabase = createClient()
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
  const label = mode === 'matrimony' ? 'Zone' : 'Tribe'

  const join = async (tribeId: string) => {
    setJoinedIds((s) => new Set([...s, tribeId]))
    await supabase.from('user_tribes').upsert({ user_id: userId, tribe_id: tribeId })
    try { await supabase.rpc('increment_tribe_member_count', { tid: tribeId }) } catch { /* non-critical */ }
  }

  const basePath = mode === 'matrimony' ? '/matrimony/zones' : '/dating/tribes'

  if (!tribes.length) {
    return <EmptyState icon={<Users size={40} />} title={`No ${label}s yet`} subtitle="Check back soon." className="p-12" />
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-1">{label}s</h1>
      <p className="text-sm text-muted mb-6">Join communities based on your interests</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tribes.map((t) => (
          <div key={t.id} className="group bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <Link href={`${basePath}/${t.id}`}>
              <div className="h-32 bg-surface-strong relative overflow-hidden">
                {t.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.cover_image_url} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted/30">
                    <Users size={40} />
                  </div>
                )}
                {t.category && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-white/80 backdrop-blur-sm">{t.category}</Badge>
                  </div>
                )}
              </div>
            </Link>
            <div className="p-4 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`${basePath}/${t.id}`}>
                  <p className="font-semibold text-foreground hover:text-accent transition truncate">{t.name}</p>
                </Link>
                {t.description && <p className="text-xs text-muted mt-0.5 line-clamp-2">{t.description}</p>}
                <p className="text-xs text-muted mt-1 flex items-center gap-1"><Users size={10} />{t.member_count} members</p>
              </div>
              <button
                onClick={() => join(t.id)}
                disabled={joinedIds.has(t.id)}
                className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition ${
                  joinedIds.has(t.id)
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-600'
                    : 'border-border text-muted hover:border-mode-accent hover:text-mode-accent'
                }`}
              >
                {joinedIds.has(t.id) ? <Check size={14} /> : <Plus size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
