interface OnboardingLayoutProps {
  children: React.ReactNode
}

const steps = ['Basic Info', 'Phone Verify', 'Selfie Check']

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#f7efe5] to-[#ead7bf] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <span className="text-lg font-bold text-accent-deep tracking-tight">Suyavaraa</span>
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-surface-strong flex items-center justify-center text-[10px] font-semibold text-muted">
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center py-8 px-4">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </main>
    </div>
  )
}
