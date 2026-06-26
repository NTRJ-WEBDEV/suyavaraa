'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heart, CheckCircle, MapPin, GraduationCap } from 'lucide-react'
import { formatAge } from '@/lib/utils/format'
import Link from 'next/link'

interface Profile {
  id: string
  full_name: string | null
  date_of_birth: string | null
  city: string | null
  is_verified: boolean
  gender: string | null
  user_profiles: { primary_photo_url: string | null; religion: string | null; education: string | null; mother_tongue: string | null }[]
}

export function MatrimonyBrowse({ userId }: { userId: string }) {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadProfiles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProfiles = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('id, full_name, date_of_birth, city, is_verified, gender, user_profiles(primary_photo_url, religion, education, mother_tongue)')
      .eq('profile_complete', true)
      .eq('is_banned', false)
      .neq('id', userId)
      .limit(24)

    const { data: liked } = await supabase
      .from('user_actions')
      .select('target_user_id')
      .eq('actor_user_id', userId)
      .eq('action_type', 'like')

    setProfiles((data as unknown as Profile[]) ?? [])
    setLikedIds(new Set(liked?.map((l) => l.target_user_id) ?? []))
    setLoading(false)
  }

  const toggleLike = async (targetId: string) => {
    const isLiked = likedIds.has(targetId)
    if (isLiked) {
      setLikedIds((s) => { const n = new Set(s); n.delete(targetId); return n })
      await supabase.from('user_actions').delete().eq('actor_user_id', userId).eq('target_user_id', targetId)
    } else {
      setLikedIds((s) => new Set([...s, targetId]))
      await supabase.from('user_actions').upsert({ actor_user_id: userId, target_user_id: targetId, action_type: 'like' })
    }
  }

  if (loading) return <PageSpinner />
  if (!profiles.length) {
    return <EmptyState icon={<Heart size={40} />} title="No profiles yet" subtitle="Check back soon." className="p-8" />
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Browse Profiles</h1>
        <p className="text-sm text-muted mt-1">Verified matrimony profiles near you</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map((p) => {
          const photo = p.user_profiles?.[0]?.primary_photo_url
          const age = formatAge(p.date_of_birth)
          const liked = likedIds.has(p.id)
          return (
            <div key={p.id} className="group bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/profile/${p.id}`}>
                <div className="aspect-square relative overflow-hidden bg-surface-strong">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={p.full_name ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Avatar name={p.full_name} size="lg" />
                    </div>
                  )}
                  {p.is_verified && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                      <CheckCircle size={14} className="text-emerald-500" fill="currentColor" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {p.full_name ?? 'Profile'}{age ? `, ${age}` : ''}
                    </p>
                    {p.city && (
                      <div className="flex items-center gap-0.5 text-xs text-muted mt-0.5">
                        <MapPin size={10} />{p.city}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleLike(p.id)}
                    className={`shrink-0 transition-transform hover:scale-110 ${liked ? 'text-[#d4a017]' : 'text-muted'}`}
                  >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.user_profiles?.[0]?.religion && (
                    <Badge variant="default" className="text-[10px] py-0">{p.user_profiles[0].religion}</Badge>
                  )}
                  {p.user_profiles?.[0]?.education && (
                    <Badge variant="default" className="text-[10px] py-0 flex items-center gap-0.5">
                      <GraduationCap size={9} />{p.user_profiles[0].education}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <Button variant="secondary" onClick={loadProfiles}>Load more</Button>
      </div>
    </div>
  )
}
