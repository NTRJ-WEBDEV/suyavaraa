'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Phone } from 'lucide-react'

export default function PhoneVerifyPage() {
  const router = useRouter()
  const supabase = createClient()

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({ phone })
    setLoading(false)
    if (err) { setError(err.message); return }
    setStep('otp')
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (err) { setError(err.message); setLoading(false); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({
        phone_number: phone,
        phone_verification_status: 'verified',
        phone_verified_at: new Date().toISOString(),
        onboarding_step: 'VideoVerification',
      }).eq('id', user.id)
    }
    setLoading(false)
    router.push('/onboarding/selfie-verify')
  }

  const skip = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({ onboarding_step: 'VideoVerification' }).eq('id', user.id)
    }
    router.push('/onboarding/selfie-verify')
  }

  return (
    <div className="bg-surface rounded-3xl shadow-xl border border-white/60 p-8">
      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
        <Phone size={26} className="text-blue-600" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Verify your phone</h1>
      <p className="text-sm text-muted mb-6">Step 2 of 3 — Mobile OTP verification</p>

      {step === 'phone' ? (
        <form onSubmit={sendOtp} className="flex flex-col gap-4">
          <Input
            label="Mobile number"
            type="tel"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            hint="Include country code, e.g. +91"
            error={error || undefined}
          />
          <Button type="submit" loading={loading} fullWidth size="lg">
            Send OTP
          </Button>
          <Button type="button" variant="ghost" fullWidth size="md" onClick={skip}>
            Skip for now
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="flex flex-col gap-4">
          <p className="text-sm text-muted">Enter the 6-digit code sent to <strong className="text-foreground">{phone}</strong></p>
          <Input
            label="OTP code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            error={error || undefined}
          />
          <Button type="submit" loading={loading} fullWidth size="lg">
            Verify
          </Button>
          <Button type="button" variant="ghost" fullWidth size="sm" onClick={() => { setStep('phone'); setOtp(''); setError('') }}>
            Use a different number
          </Button>
        </form>
      )}
    </div>
  )
}
