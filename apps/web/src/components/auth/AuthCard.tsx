import Link from 'next/link'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff7ed] via-[#f7efe5] to-[#ead7bf] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-accent-deep tracking-tight">Suyavaraa</span>
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="bg-surface rounded-3xl shadow-[0_20px_60px_rgba(29,20,15,0.10)] border border-white/60 p-8">
          {children}
        </div>
        {footer && (
          <div className="mt-6 text-center text-sm text-muted">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
