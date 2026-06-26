'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate, shortId } from '@/lib/utils/format'
import { Search, CheckCircle, Shield, Ban } from 'lucide-react'

interface AdminUser {
  id: string
  full_name: string | null
  email: string | null
  gender: string | null
  city: string | null
  is_verified: boolean
  is_banned: boolean
  trust_score: number
  verification_status: string
  created_at: string
  profile_complete: boolean
}

export function UsersClient({ users: initial, adminId, canModerate }: {
  users: AdminUser[]
  adminId: string
  canModerate: boolean
}) {
  const supabase = createClient()
  const [users, setUsers] = useState(initial)
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  const filtered = users.filter((u) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q)
  })

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    setProcessing(userId)
    const action = currentlyBanned ? 'unban' : 'ban'
    await supabase.from('users').update({ is_banned: !currentlyBanned, ban_reason: currentlyBanned ? null : 'Admin action' }).eq('id', userId)
    await supabase.from('admin_activity_log').insert({ admin_id: adminId, action: `user_${action}`, target_type: 'user', target_id: userId, details: {} })
    setUsers((us) => us.map((u) => u.id === userId ? { ...u, is_banned: !currentlyBanned } : u))
    setProcessing(null)
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-white/40 mt-1">{users.length} total</p>
        </div>
        <div className="w-64">
          <Input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">City</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Trust</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Joined</th>
              {canModerate && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition">
                <td className="px-4 py-3">
                  <Link href={`/profile/${u.id}`} target="_blank" className="hover:underline">
                    <p className="font-medium text-white/90">{u.full_name ?? 'Unknown'}</p>
                    <p className="text-xs text-white/30">{u.email ?? shortId(u.id)}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-white/50">{u.city ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.is_verified && <Badge variant="success" className="text-[10px]"><CheckCircle size={9} />Verified</Badge>}
                    {u.is_banned && <Badge variant="danger" className="text-[10px]"><Ban size={9} />Banned</Badge>}
                    {!u.profile_complete && <Badge variant="warning" className="text-[10px]">Incomplete</Badge>}
                    {!u.is_verified && !u.is_banned && <Badge variant="default" className="text-[10px] bg-white/10 text-white/50 border-0"><Shield size={9} />{u.verification_status}</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${u.trust_score}%` }} />
                    </div>
                    <span className="text-xs text-white/40">{u.trust_score}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-white/30">{formatDate(u.created_at)}</td>
                {canModerate && (
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={u.is_banned ? 'secondary' : 'danger'}
                      loading={processing === u.id}
                      onClick={() => toggleBan(u.id, u.is_banned)}
                      className={u.is_banned ? 'text-xs bg-white/10 border-white/10 text-white hover:bg-white/20' : 'text-xs'}
                    >
                      {u.is_banned ? 'Unban' : 'Ban'}
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-white/30 text-sm py-12">No users match your search.</p>
        )}
      </div>
    </div>
  )
}
