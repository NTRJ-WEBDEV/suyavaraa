import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Star, CheckCircle, Zap, Heart, Shield } from 'lucide-react'

const features = [
  { icon: <Heart size={18} />, text: 'Unlimited likes & superlikes' },
  { icon: <Shield size={18} />, text: 'See who liked you' },
  { icon: <Zap size={18} />, text: 'Priority in discovery' },
  { icon: <CheckCircle size={18} />, text: 'Premium badge on profile' },
  { icon: <Star size={18} />, text: 'Advanced filters' },
]

export default async function PremiumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: up }] = await Promise.all([
    supabase.from('users').select('full_name, preferred_mode, is_premium').eq('id', user.id).single(),
    supabase.from('user_profiles').select('primary_photo_url').eq('user_id', user.id).single(),
  ])

  return (
    <AppShell user={{ name: profile?.full_name ?? null, photo: up?.primary_photo_url ?? null }} initialMode={profile?.preferred_mode ?? 'dating'}>
      <div className="max-w-md mx-auto px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Star size={28} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Go Premium</h1>
        {profile?.is_premium ? (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 mt-6">
            <p className="text-lg font-semibold text-amber-700 mb-2">You&apos;re already Premium!</p>
            <Badge variant="warning">Active</Badge>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-8">Unlock the full Suyavaraa experience</p>
            <div className="bg-surface rounded-2xl border border-border p-6 text-left mb-6 shadow-sm">
              <ul className="space-y-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="text-amber-500">{f.icon}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-3xl font-bold">₹499</p>
              <p className="text-white/80 text-sm">per month</p>
              <button className="mt-4 w-full bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition">
                Subscribe Now
              </button>
              <p className="text-white/60 text-xs mt-2">Cancel anytime · Secure payment</p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
