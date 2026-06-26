'use client'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatAge, formatDate } from '@/lib/utils/format'
import { CheckCircle, Shield, Star, Edit, MapPin, Calendar } from 'lucide-react'
import type { Tables } from '@/lib/types/database'

interface OwnProfileViewProps {
  profile: Tables<'users'> | null
  userProfile: Tables<'user_profiles'> | null
}

export function OwnProfileView({ profile, userProfile }: OwnProfileViewProps) {
  if (!profile) return null

  const age = formatAge(profile.date_of_birth)
  const verStatus = profile.verification_status ?? 'unverified'
  const trustScore = profile.trust_score ?? 50

  const verBadge = {
    verified: { label: 'Verified', variant: 'success' as const, icon: <CheckCircle size={12} /> },
    pending: { label: 'Pending review', variant: 'warning' as const, icon: <Shield size={12} /> },
    unverified: { label: 'Not verified', variant: 'default' as const, icon: <Shield size={12} /> },
    rejected: { label: 'Rejected', variant: 'danger' as const, icon: <Shield size={12} /> },
  }[verStatus] ?? { label: verStatus, variant: 'default' as const, icon: null }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header card */}
      <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-br from-accent/20 to-accent-deep/10" />
        {/* Avatar */}
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end justify-between">
            <div className="ring-4 ring-surface rounded-full">
              <Avatar src={userProfile?.primary_photo_url} name={profile.full_name} size="xl" />
            </div>
            <Link href="/profile/edit">
              <Button variant="secondary" size="sm"><Edit size={14} />Edit profile</Button>
            </Link>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{profile.full_name ?? 'Your profile'}</h1>
              {profile.is_verified && <CheckCircle size={18} className="text-emerald-500" fill="currentColor" />}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted">
              {age && <span className="flex items-center gap-1"><Calendar size={12} />{age} years</span>}
              {profile.city && <span className="flex items-center gap-1"><MapPin size={12} />{profile.city}</span>}
              {profile.gender && <span>{profile.gender}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant={verBadge.variant} className="flex items-center gap-1">
                {verBadge.icon}{verBadge.label}
              </Badge>
              {profile.is_premium && <Badge variant="warning" className="flex items-center gap-1"><Star size={10} />Premium</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Trust score */}
      <div className="bg-surface rounded-2xl border border-border p-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">Trust Score</span>
          <span className="text-2xl font-bold text-accent">{trustScore}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-strong overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-accent rounded-full transition-all" style={{ width: `${trustScore}%` }} />
        </div>
        <p className="text-xs text-muted mt-2">Higher scores unlock more features. Complete verification to boost your score.</p>
      </div>

      {/* Profile details */}
      {(profile.bio || userProfile?.about) && (
        <div className="bg-surface rounded-2xl border border-border p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-2">About</h2>
          <p className="text-sm text-muted">{profile.bio ?? userProfile?.about}</p>
        </div>
      )}

      {/* Extended profile */}
      {userProfile && (
        <div className="bg-surface rounded-2xl border border-border p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3">Profile Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {userProfile.occupation && <div><span className="text-muted">Occupation</span><p className="font-medium text-foreground">{userProfile.occupation}</p></div>}
            {userProfile.education && <div><span className="text-muted">Education</span><p className="font-medium text-foreground">{userProfile.education}</p></div>}
            {userProfile.religion && <div><span className="text-muted">Religion</span><p className="font-medium text-foreground">{userProfile.religion}</p></div>}
            {userProfile.mother_tongue && <div><span className="text-muted">Mother tongue</span><p className="font-medium text-foreground">{userProfile.mother_tongue}</p></div>}
            {userProfile.height_cm && <div><span className="text-muted">Height</span><p className="font-medium text-foreground">{userProfile.height_cm} cm</p></div>}
          </div>
          {userProfile.interests?.length > 0 && (
            <div className="mt-3">
              <span className="text-muted text-sm">Interests</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {userProfile.interests.map((i) => <Badge key={i} variant="mode">{i}</Badge>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/profile/premium"><Button variant="secondary" fullWidth><Star size={15} className="text-amber-500" />Go Premium</Button></Link>
        <Link href="/support"><Button variant="ghost" fullWidth>Settings & Help</Button></Link>
      </div>
    </div>
  )
}
