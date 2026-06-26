'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Camera } from 'lucide-react'

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

export default function BasicInfoPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ fullName: '', dateOfBirth: '', gender: '', city: '', bio: '' })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.fullName.trim()) { setError('Full name is required'); return }
    if (!form.dateOfBirth) { setError('Date of birth is required'); return }
    if (!form.gender) { setError('Please select a gender'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in'); setLoading(false); return }

    let photoUrl: string | undefined
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${user.id}/profile.${ext}`
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, photoFile, { upsert: true })
      if (uploadErr) { setError(uploadErr.message); setLoading(false); return }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      photoUrl = data.publicUrl
    }

    const { error: userErr } = await supabase.from('users').upsert({
      id: user.id,
      full_name: form.fullName.trim(),
      date_of_birth: form.dateOfBirth,
      gender: form.gender,
      city: form.city.trim() || null,
      bio: form.bio.trim() || null,
      onboarding_step: 'MobileOtpVerification',
    })
    if (userErr) { setError(userErr.message); setLoading(false); return }

    if (photoUrl) {
      await supabase.from('user_profiles').upsert({ user_id: user.id, primary_photo_url: photoUrl })
    }

    setLoading(false)
    router.push('/onboarding/phone-verify')
  }

  return (
    <div className="bg-surface rounded-3xl shadow-xl border border-white/60 p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-1">Tell us about yourself</h1>
      <p className="text-sm text-muted mb-6">Step 1 of 3 — Basic profile information</p>

      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-24 h-24 rounded-full border-2 border-dashed border-border bg-surface-strong flex items-center justify-center overflow-hidden hover:border-accent transition"
        >
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted">
              <Camera size={22} />
              <span className="text-[10px] font-medium">Add photo</span>
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Your full name"
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          required
        />
        <Input
          label="Date of birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => set('dateOfBirth', e.target.value)}
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Gender</label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => set('gender', g)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  form.gender === g
                    ? 'bg-accent text-white border-accent'
                    : 'border-border bg-surface text-muted hover:border-accent/50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="City"
          type="text"
          placeholder="e.g. Chennai"
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Bio <span className="text-muted font-normal">(optional)</span></label>
          <textarea
            rows={3}
            placeholder="Write a short bio…"
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          Continue
        </Button>
      </form>
    </div>
  )
}
