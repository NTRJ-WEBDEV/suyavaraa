'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Camera, CheckCircle } from 'lucide-react'

export default function SelfieVerifyPage() {
  const router = useRouter()
  const supabase = createClient()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch {
      setError('Camera access denied. Please allow camera permissions and try again.')
    }
  }

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }, [])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      setCapturedBlob(blob)
      setCapturedUrl(URL.createObjectURL(blob))
      stopCamera()
    }, 'image/jpeg', 0.85)
  }

  const retake = () => {
    setCapturedBlob(null)
    setCapturedUrl(null)
    startCamera()
  }

  const handleSubmit = async () => {
    if (!capturedBlob) { setError('Please take a selfie first'); return }
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in'); setLoading(false); return }

    const selfiePath = `${user.id}/selfie.jpg`
    const { error: uploadErr } = await supabase.storage
      .from('verifications')
      .upload(selfiePath, capturedBlob, { upsert: true, contentType: 'image/jpeg' })
    if (uploadErr) { setError(uploadErr.message); setLoading(false); return }

    const { data: selfieData } = supabase.storage.from('verifications').getPublicUrl(selfiePath)

    let idUrl: string | undefined
    if (idFile) {
      const ext = idFile.name.split('.').pop()
      const idPath = `${user.id}/id.${ext}`
      const { error: idErr } = await supabase.storage.from('verifications').upload(idPath, idFile, { upsert: true })
      if (!idErr) {
        const { data } = supabase.storage.from('verifications').getPublicUrl(idPath)
        idUrl = data.publicUrl
      }
    }

    await supabase.from('verification_requests').insert({
      user_id: user.id,
      status: 'pending',
      request_type: idUrl ? 'selfie_with_id' : 'selfie_only',
      selfie_url: selfieData.publicUrl,
      media_url: selfieData.publicUrl,
      id_card_url: idUrl ?? null,
    })

    await supabase.from('users').update({
      onboarding_step: 'Done',
      profile_complete: true,
      verification_status: 'pending',
    }).eq('id', user.id)

    setLoading(false)
    setDone(true)
    setTimeout(() => router.push('/home'), 2000)
  }

  if (done) {
    return (
      <div className="bg-surface rounded-3xl shadow-xl border border-white/60 p-8 text-center">
        <CheckCircle size={56} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">You&apos;re all set!</h2>
        <p className="text-sm text-muted">Your selfie was submitted for review. Taking you to the app…</p>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-3xl shadow-xl border border-white/60 p-8">
      <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
        <Camera size={26} className="text-purple-600" />
      </div>
      <h1 className="text-2xl font-semibold mb-1">Selfie verification</h1>
      <p className="text-sm text-muted mb-6">Step 3 of 3 — A quick selfie to verify your identity</p>

      <div className="mb-6 rounded-2xl overflow-hidden bg-foreground/5 aspect-[4/3] flex items-center justify-center relative">
        {cameraActive && !capturedUrl && (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        {capturedUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={capturedUrl} alt="selfie" className="w-full h-full object-cover" />
        )}
        {!cameraActive && !capturedUrl && (
          <div className="flex flex-col items-center gap-2 text-muted py-8">
            <Camera size={40} strokeWidth={1.5} />
            <span className="text-sm">Camera will appear here</span>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col gap-3">
        {!cameraActive && !capturedUrl && (
          <Button variant="secondary" fullWidth onClick={startCamera}>
            Open camera
          </Button>
        )}
        {cameraActive && !capturedUrl && (
          <Button variant="mode" fullWidth onClick={capturePhoto}>
            Capture selfie
          </Button>
        )}
        {capturedUrl && (
          <Button variant="ghost" fullWidth onClick={retake}>
            Retake
          </Button>
        )}

        {capturedUrl && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">
                ID card <span className="text-muted font-normal">(optional — speeds up verification)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                className="text-sm text-muted file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-surface-strong file:text-foreground file:text-sm file:cursor-pointer"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button variant="mode" fullWidth size="lg" loading={loading} onClick={handleSubmit}>
              Submit for review
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
