'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthCard } from '@/components/auth/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/home')
    router.refresh()
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Suyavaraa account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-accent font-semibold hover:underline">Sign up</Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <div className="flex flex-col gap-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            error={error || undefined}
          />
          <Link href="/forgot-password" className="text-xs text-accent hover:underline self-end mt-0.5">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          Sign in
        </Button>
      </form>
    </AuthCard>
  )
}
