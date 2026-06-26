'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heart, X, Star, SlidersHorizontal, MapPin, CheckCircle } from 'lucide-react'
import { formatAge } from '@/lib/utils/format'

interface Profile {
  id: string
  full_name: string | null
  date_of_birth: string | null
  city: string | null
  is_verified: boolean
  trust_score: number
  user_profiles: { primary_photo_url: string | null; about: string | null; occupation: string | null }[]
}

export function DatingDiscover({ userId }: { userId: string }) {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [feedback, setFeedback] = useState<'like' | 'pass' | 'superlike' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)

  useEffect(() => {
    loadProfiles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProfiles = async () => {
    setLoading(true)
    const { data: acted } = await supabase
      .from('user_actions')
      .select('target_user_id')
      .eq('actor_user_id', userId)

    const excludeIds = [userId, ...(acted?.map((a) => a.target_user_id) ?? [])]

    const { data } = await supabase
      .from('users')
      .select('id, full_name, date_of_birth, city, is_verified, trust_score, user_profiles(primary_photo_url, about, occupation)')
      .eq('profile_complete', true)
      .eq('is_banned', false)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(20)

    setProfiles((data as unknown as Profile[]) ?? [])
    setLoading(false)
  }

  const currentProfile = profiles[currentIdx]

  const doAction = async (type: 'like' | 'pass' | 'superlike') => {
    if (!currentProfile) return
    setFeedback(type)

    await supabase.from('user_actions').upsert({
      actor_user_id: userId,
      target_user_id: currentProfile.id,
      action_type: type,
    })

    if (type === 'like' || type === 'superlike') {
      const { data: theyLikedMe } = await supabase
        .from('user_actions')
        .select('id')
        .eq('actor_user_id', currentProfile.id)
        .eq('target_user_id', userId)
        .in('action_type', ['like', 'superlike'])
        .single()

      if (theyLikedMe) {
        await supabase.from('matches').insert({ user1_id: userId, user2_id: currentProfile.id })
      }
    }

    setTimeout(() => {
      setFeedback(null)
      setDragX(0)
      setCurrentIdx((i) => i + 1)
    }, 400)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true)
    startX.current = e.clientX
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    setDragX(e.clientX - startX.current)
  }

  const onPointerUp = () => {
    setDragging(false)
    if (dragX > 100) doAction('like')
    else if (dragX < -100) doAction('pass')
    else setDragX(0)
  }

  if (loading) return <PageSpinner />

  if (!currentProfile) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <EmptyState
          icon={<Heart size={48} />}
          title="You've seen everyone for now"
          subtitle="Check back later for new profiles, or adjust your filters."
          action={<Button variant="secondary" onClick={() => { setCurrentIdx(0); loadProfiles() }}>Refresh</Button>}
        />
      </div>
    )
  }

  const photo = currentProfile.user_profiles?.[0]?.primary_photo_url
  const age = formatAge(currentProfile.date_of_birth)
  const rotation = dragging ? dragX * 0.08 : 0
  const likeOpacity = Math.max(0, Math.min(1, dragX / 80))
  const passOpacity = Math.max(0, Math.min(1, -dragX / 80))

  return (
    <div className="flex flex-col h-full items-center justify-center p-4 gap-6">
      {/* Card stack */}
      <div className="relative w-full max-w-sm aspect-[3/4] select-none">
        {/* Background cards */}
        {profiles[currentIdx + 1] && (
          <div className="absolute inset-0 rounded-3xl bg-surface border border-border shadow-lg scale-95 translate-y-2 z-0" />
        )}
        {/* Main card */}
        <div
          ref={cardRef}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            transition: dragging ? 'none' : 'transform 0.3s ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div className="w-full h-full rounded-3xl overflow-hidden bg-surface border border-border shadow-2xl">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={currentProfile.full_name ?? ''} className="w-full h-full object-cover" draggable={false} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-strong">
                <Avatar name={currentProfile.full_name} size="xl" />
              </div>
            )}

            {/* Like / pass overlays */}
            <div className="absolute top-8 left-6 rotate-[-20deg] border-4 border-emerald-400 text-emerald-400 rounded-xl px-4 py-1.5 text-2xl font-black uppercase" style={{ opacity: likeOpacity }}>LIKE</div>
            <div className="absolute top-8 right-6 rotate-[20deg] border-4 border-red-400 text-red-400 rounded-xl px-4 py-1.5 text-2xl font-black uppercase" style={{ opacity: passOpacity }}>NOPE</div>

            {/* Feedback flash */}
            {feedback === 'like' && <div className="absolute inset-0 bg-emerald-400/20 rounded-3xl flex items-center justify-center"><Heart size={80} className="text-emerald-500" fill="currentColor" /></div>}
            {feedback === 'pass' && <div className="absolute inset-0 bg-red-400/20 rounded-3xl flex items-center justify-center"><X size={80} className="text-red-500" /></div>}
            {feedback === 'superlike' && <div className="absolute inset-0 bg-blue-400/20 rounded-3xl flex items-center justify-center"><Star size={80} className="text-blue-500" fill="currentColor" /></div>}

            {/* Profile info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 rounded-b-3xl">
              <div className="flex items-center gap-2">
                <span className="text-white text-xl font-bold">{currentProfile.full_name ?? 'Someone'}</span>
                {age && <span className="text-white/80 text-lg">{age}</span>}
                {currentProfile.is_verified && <CheckCircle size={16} className="text-emerald-400" fill="currentColor" />}
              </div>
              {currentProfile.city && (
                <div className="flex items-center gap-1 text-white/70 text-sm mt-0.5">
                  <MapPin size={12} />{currentProfile.city}
                </div>
              )}
              {currentProfile.user_profiles?.[0]?.occupation && (
                <Badge variant="default" className="mt-2 bg-white/20 text-white border-0">
                  {currentProfile.user_profiles[0].occupation}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => doAction('pass')}
          className="w-14 h-14 rounded-full bg-surface border-2 border-red-200 flex items-center justify-center text-red-400 shadow-md hover:border-red-400 hover:scale-105 transition-all"
        >
          <X size={24} />
        </button>
        <button
          onClick={() => doAction('superlike')}
          className="w-12 h-12 rounded-full bg-surface border-2 border-blue-200 flex items-center justify-center text-blue-400 shadow hover:border-blue-400 hover:scale-105 transition-all"
        >
          <Star size={20} />
        </button>
        <button
          onClick={() => doAction('like')}
          className="w-14 h-14 rounded-full bg-surface border-2 border-emerald-200 flex items-center justify-center text-emerald-500 shadow-md hover:border-emerald-400 hover:scale-105 transition-all"
        >
          <Heart size={24} />
        </button>
        <button className="w-12 h-12 rounded-full bg-surface border-2 border-border flex items-center justify-center text-muted shadow hover:border-accent/50 hover:scale-105 transition-all">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Progress */}
      <p className="text-xs text-muted">{profiles.length - currentIdx} profiles left</p>
    </div>
  )
}
