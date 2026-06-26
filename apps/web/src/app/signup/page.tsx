'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthCard } from '@/components/auth/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthCard title="Check your email" subtitle="We sent you a verification link.">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm text-muted mb-1">Sent to <strong className="text-foreground">{email}</strong></p>
          <p className="text-sm text-muted">Click the link in the email to confirm your account, then return here to log in.</p>
          <Button variant="secondary" size="md" className="mt-6 w-full" onClick={() => router.push('/login')}>
            Go to login
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join Suyavaraa — dating and matrimony with verified trust"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          error={error || undefined}
          hint="At least 8 characters"
        />
        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          Create account
        </Button>
        <p className="text-xs text-muted text-center">
          By signing up you agree to our{' '}
          <Link href="/support/terms" className="text-accent hover:underline">Terms</Link>{' '}
          and{' '}
          <Link href="/support/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
        </p>
      </form>
    </AuthCard>
  )
}
