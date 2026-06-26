'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Tabs } from '@/components/ui/Tabs'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelativeTime } from '@/lib/utils/format'
import { MessageSquare, Send, ArrowLeft, CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Match {
  id: string
  other_user: { id: string; full_name: string | null; is_verified: boolean }
  other_photo: string | null
  last_message: string | null
  last_message_at: string | null
  unread: number
}

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
}

export function ConnectionsContent({ userId }: { userId: string }) {
  const supabase = createClient()
  const [tab, setTab] = useState('matches')
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    loadMatches()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!selectedMatch) return
    loadMessages(selectedMatch.id)

    channelRef.current?.unsubscribe()
    channelRef.current = supabase
      .channel(`messages:${selectedMatch.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${selectedMatch.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { channelRef.current?.unsubscribe() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatch?.id])

  const loadMatches = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('matches')
      .select('id, user1_id, user2_id, created_at')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    const enriched: Match[] = await Promise.all(
      data.map(async (m) => {
        const otherId = m.user1_id === userId ? m.user2_id : m.user1_id
        const [{ data: u }, { data: up }, { data: lastMsg }] = await Promise.all([
          supabase.from('users').select('id, full_name, is_verified').eq('id', otherId).single(),
          supabase.from('user_profiles').select('primary_photo_url').eq('user_id', otherId).single(),
          supabase.from('messages').select('content, created_at').eq('match_id', m.id).order('created_at', { ascending: false }).limit(1).single(),
        ])
        return {
          id: m.id,
          other_user: u ?? { id: otherId, full_name: null, is_verified: false },
          other_photo: up?.primary_photo_url ?? null,
          last_message: lastMsg?.content ?? null,
          last_message_at: lastMsg?.created_at ?? m.created_at,
          unread: 0,
        }
      }),
    )
    setMatches(enriched)
    setLoading(false)
  }

  const loadMessages = async (matchId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at, read_at')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
    setMessages((data as Message[]) ?? [])
  }

  const sendMessage = async () => {
    if (!msgText.trim() || !selectedMatch || sending) return
    setSending(true)
    const text = msgText.trim()
    setMsgText('')
    await supabase.from('messages').insert({ match_id: selectedMatch.id, sender_id: userId, content: text })
    setSending(false)
  }

  if (selectedMatch) {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface shrink-0">
          <button onClick={() => setSelectedMatch(null)} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-strong transition">
            <ArrowLeft size={18} />
          </button>
          <Avatar src={selectedMatch.other_photo} name={selectedMatch.other_user.full_name} size="sm" />
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
              {selectedMatch.other_user.full_name ?? 'Match'}
              {selectedMatch.other_user.is_verified && <CheckCircle size={12} className="text-emerald-500" fill="currentColor" />}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {messages.map((msg) => {
            const mine = msg.sender_id === userId
            return (
              <div key={msg.id} className={clsx('flex', mine ? 'justify-end' : 'justify-start')}>
                <div className={clsx(
                  'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                  mine ? 'bg-mode-accent text-white rounded-br-sm' : 'bg-surface border border-border text-foreground rounded-bl-sm',
                )}>
                  {msg.content}
                  <p className={clsx('text-[10px] mt-1', mine ? 'text-white/60' : 'text-muted')}>{formatRelativeTime(msg.created_at)}</p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-3 border-t border-border bg-surface flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Type a message…"
            className="flex-1 h-10 rounded-xl border border-border bg-surface-strong px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            onClick={sendMessage}
            disabled={!msgText.trim() || sending}
            className="w-10 h-10 rounded-xl bg-mode-accent text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-0">
        <h1 className="text-2xl font-semibold mb-4">Connections</h1>
        <Tabs
          tabs={[
            { id: 'matches', label: 'Matches', count: matches.length },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {loading ? (
          <PageSpinner />
        ) : matches.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={40} />}
            title="No matches yet"
            subtitle="Keep exploring to get your first match!"
            className="py-20"
          />
        ) : (
          <ul className="space-y-1 py-2">
            {matches.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => setSelectedMatch(m)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-strong transition text-left"
                >
                  <Avatar src={m.other_photo} name={m.other_user.full_name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-foreground">{m.other_user.full_name ?? 'Match'}</span>
                      {m.other_user.is_verified && <CheckCircle size={11} className="text-emerald-500" fill="currentColor" />}
                    </div>
                    {m.last_message && (
                      <p className="text-xs text-muted truncate mt-0.5">{m.last_message}</p>
                    )}
                  </div>
                  {m.last_message_at && (
                    <span className="text-[10px] text-muted shrink-0">{formatRelativeTime(m.last_message_at)}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
