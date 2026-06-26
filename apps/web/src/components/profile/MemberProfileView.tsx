'use client'
import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatAge } from '@/lib/utils/format'
import { CheckCircle, Heart, X, Star, MapPin, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MemberProfileViewProps {
  profile: { id: string; full_name: string | null; date_of_birth: string | null; gender: string | null; city: string | null; bio: string | null; is_verified: boolean; trust_score: number; trust_level: string }
  userProfile: { primary_photo_url: string | null; about: string | null; occupation: string | null; education: string | null; religion: string | null; mother_tongue: string | null; height_cm: number | null; interests: string[]; additional_photos: string[] } | null
  viewerId: string
  existingAction: string | null
}

export function MemberProfileView({ profile, userProfile, viewerId, existingAction }: MemberProfileViewProps) {
  const supabase = createClient()
  const [action, setAction] = useState<string | null>(existingAction)
  const [loading, setLoading] = useState(false)

  const doAction = async (type: 'like' | 'pass' | 'superlike') => {
    if (loading) return
    setLoading(true)
    setAction(type)
    await supabase.from('user_actions').upsert({ actor_user_id: viewerId, target_user_id: profile.id, action_type: type })
    if (type === 'like' || type === 'superlike') {
      const { data: theyLiked } = await supabase
        .from('user_actions')
        .select('id')
        .eq('actor_user_id', profile.id)
        .eq('target_user_id', viewerId)
        .in('action_type', ['like', 'superlike'])
        .single()
      if (theyLiked) {
        await supabase.from('matches').insert({ user1_id: viewerId, user2_id: profile.id })
      }
    }
    setLoading(false)
  }

  const age = formatAge(profile.date_of_birth)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden mb-6">
        {userProfile?.primary_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={userProfile.primary_photo_url} alt={profile.full_name ?? ''} className="w-full aspect-[4/3] object-cover" />
        ) : (
          <div className="aspect-[4/3] bg-surface-strong flex items-center justify-center">
            <Avatar name={profile.full_name} size="xl" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.full_name ?? 'Profile'}</h1>
                {profile.is_verified && <CheckCircle size={20} className="text-emerald-500" fill="currentColor" />}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted">
                {age && <span>{age} years</span>}
                {profile.city && <span className="flex items-center gap-1"><MapPin size={12} />{profile.city}</span>}
                {profile.gender && <span>{profile.gender}</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Trust</p>
              <p className="text-2xl font-bold text-accent">{profile.trust_score}</p>
            </div>
          </div>

          {(profile.bio || userProfile?.about) && (
            <p className="mt-4 text-sm text-muted leading-6">{profile.bio ?? userProfile?.about}</p>
          )}

          {userProfile && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {userProfile.occupation && <div><span className="text-muted text-xs">Work</span><p className="font-medium">{userProfile.occupation}</p></div>}
              {userProfile.education && <div><span className="text-muted text-xs">Education</span><p className="font-medium">{userProfile.education}</p></div>}
              {userProfile.religion && <div><span className="text-muted text-xs">Religion</span><p className="font-medium">{userProfile.religion}</p></div>}
              {userProfile.mother_tongue && <div><span className="text-muted text-xs">Language</span><p className="font-medium">{userProfile.mother_tongue}</p></div>}
            </div>
          )}

          {(userProfile?.interests?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {userProfile?.interests.map((i) => <Badge key={i} variant="mode">{i}</Badge>)}
            </div>
          )}
        </div>
      </div>

      {/* Additional photos */}
      {(userProfile?.additional_photos?.length ?? 0) > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3">Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {userProfile!.additional_photos.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="aspect-square object-cover rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => doAction('pass')}
          disabled={loading || action === 'pass'}
          className="flex-1"
        >
          <X size={18} className="text-red-400" />Decline
        </Button>
        <button
          onClick={() => doAction('superlike')}
          disabled={loading}
          className="w-12 h-12 rounded-full bg-surface border-2 border-blue-200 flex items-center justify-center text-blue-400 hover:border-blue-400 transition shrink-0 self-center"
        >
          <Star size={18} />
        </button>
        <Button
          variant="mode"
          size="lg"
          onClick={() => doAction('like')}
          disabled={loading || action === 'like' || action === 'superlike'}
          className="flex-1"
        >
          <Heart size={18} />{action === 'like' ? 'Liked ✓' : 'Like'}
        </Button>
      </div>

      <button className="mt-4 flex items-center gap-1.5 text-xs text-muted hover:text-red-500 transition mx-auto">
        <Flag size={12} />Report this profile
      </button>
    </div>
  )
}
