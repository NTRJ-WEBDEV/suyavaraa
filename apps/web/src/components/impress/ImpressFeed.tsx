'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heart, Plus, ImagePlus, CheckCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'

interface Post {
  id: string
  user_id: string
  caption: string | null
  media_url: string | null
  reaction_count: number
  created_at: string
  users: { full_name: string | null; is_verified: boolean }[]
  user_profiles: { primary_photo_url: string | null }[]
}

export function ImpressFeed({ userId }: { userId: string }) {
  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [caption, setCaption] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  useEffect(() => { loadPosts() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPosts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('id, user_id, caption, media_url, reaction_count, created_at, users(full_name, is_verified), user_profiles(primary_photo_url)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(30)

    const { data: myReactions } = await supabase
      .from('post_reactions')
      .select('post_id')
      .eq('user_id', userId)

    setPosts((data as unknown as Post[]) ?? [])
    setLikedIds(new Set(myReactions?.map((r) => r.post_id) ?? []))
    setLoading(false)
  }

  const toggleLike = async (postId: string) => {
    const liked = likedIds.has(postId)
    if (liked) {
      setLikedIds((s) => { const n = new Set(s); n.delete(postId); return n })
      setPosts((ps) => ps.map((p) => p.id === postId ? { ...p, reaction_count: p.reaction_count - 1 } : p))
      await supabase.from('post_reactions').delete().eq('user_id', userId).eq('post_id', postId)
    } else {
      setLikedIds((s) => new Set([...s, postId]))
      setPosts((ps) => ps.map((p) => p.id === postId ? { ...p, reaction_count: p.reaction_count + 1 } : p))
      await supabase.from('post_reactions').upsert({ user_id: userId, post_id: postId, reaction_type: 'heart' })
    }
  }

  const createPost = async () => {
    if (!caption.trim() && !mediaFile) return
    setPosting(true)
    let mediaUrl: string | undefined
    if (mediaFile) {
      const ext = mediaFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('posts').upload(path, mediaFile)
      if (!error) {
        const { data } = supabase.storage.from('posts').getPublicUrl(path)
        mediaUrl = data.publicUrl
      }
    }
    await supabase.from('posts').insert({
      user_id: userId,
      caption: caption.trim() || null,
      media_url: mediaUrl ?? null,
      media_type: mediaFile?.type?.startsWith('video') ? 'video' : 'image',
      is_active: true,
    })
    setCaption('')
    setMediaFile(null)
    setMediaPreview(null)
    setCreateOpen(false)
    setPosting(false)
    loadPosts()
  }

  if (loading) return <PageSpinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Impress</h1>
          <p className="text-sm text-muted">Show off your best moments</p>
        </div>
        <Button variant="mode" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={16} />Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <EmptyState icon={<ImagePlus size={40} />} title="No posts yet" subtitle="Be the first to share something!" action={<Button variant="mode" onClick={() => setCreateOpen(true)}>Create post</Button>} />
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const author = post.users?.[0]
            const photo = post.user_profiles?.[0]?.primary_photo_url
            const liked = likedIds.has(post.id)
            return (
              <article key={post.id} className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 p-4 pb-3">
                  <Avatar src={photo} name={author?.full_name} size="sm" />
                  <div>
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      {author?.full_name ?? 'User'}
                      {author?.is_verified && <CheckCircle size={12} className="text-emerald-500" fill="currentColor" />}
                    </div>
                    <p className="text-xs text-muted">{formatRelativeTime(post.created_at)}</p>
                  </div>
                </div>
                {post.media_url && (
                  <div className="aspect-video bg-surface-strong">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.media_url} alt={post.caption ?? ''} className="w-full h-full object-cover" />
                  </div>
                )}
                {post.caption && <p className="px-4 py-3 text-sm text-foreground">{post.caption}</p>}
                <div className="flex items-center gap-4 px-4 py-3 border-t border-border/40">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition ${liked ? 'text-red-500' : 'text-muted hover:text-red-400'}`}
                  >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                    {post.reaction_count > 0 && post.reaction_count}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create post" size="sm">
        <div className="flex flex-col gap-3">
          <textarea
            rows={3}
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
          />
          {mediaPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaPreview} alt="" className="rounded-xl max-h-40 object-cover" />
          )}
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-foreground transition">
            <ImagePlus size={16} /> Add photo
            <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              setMediaFile(f)
              setMediaPreview(URL.createObjectURL(f))
            }} />
          </label>
          <Button variant="mode" fullWidth loading={posting} onClick={createPost}>Post</Button>
        </div>
      </Modal>
    </div>
  )
}
