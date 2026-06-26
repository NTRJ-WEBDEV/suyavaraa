'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Award } from 'lucide-react'

const TYPES = ['Traditional', 'Modern', 'Cultural', 'Community']

export function CreateSuyamvaramForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ title: '', description: '', type: '', deadline: '', maxParticipants: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setLoading(true)
    const { error: err } = await supabase.from('suyamvaram_challenges').insert({
      created_by: userId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      challenge_type: form.type || null,
      deadline: form.deadline || null,
      max_participants: form.maxParticipants ? parseInt(form.maxParticipants) : null,
      is_active: true,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/matrimony/suyamvaram')
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#fdf6e3] flex items-center justify-center">
          <Award size={20} className="text-[#d4a017]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Create Suyamvaram</h1>
          <p className="text-sm text-muted">Host a formal matrimony event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-6 flex flex-col gap-4">
        <Input label="Event title" type="text" placeholder="e.g. Iyer Community Suyamvaram" value={form.title} onChange={(e) => set('title', e.target.value)} required />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Description <span className="text-muted font-normal">(optional)</span></label>
          <textarea rows={3} placeholder="Describe the event…" value={form.description} onChange={(e) => set('description', e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Type <span className="text-muted font-normal">(optional)</span></label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button key={t} type="button" onClick={() => set('type', form.type === t ? '' : t)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${form.type === t ? 'bg-[#d4a017] text-white border-[#d4a017]' : 'border-border text-muted hover:border-[#d4a017]/50'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Application deadline" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
          <Input label="Max participants" type="number" min="2" placeholder="Unlimited" value={form.maxParticipants} onChange={(e) => set('maxParticipants', e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" variant="mode" fullWidth size="lg" loading={loading}>Create event</Button>
      </form>
    </div>
  )
}
