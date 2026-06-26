'use client'
import { useMode } from './ModeProvider'

export function ModeSwitcher() {
  const { mode, setMode } = useMode()
  return (
    <div className="flex rounded-xl bg-sidebar-bg/5 border border-border/30 p-0.5 text-xs font-semibold">
      <button
        onClick={() => setMode('dating')}
        className={`flex-1 px-3 py-1.5 rounded-lg transition-all ${
          mode === 'dating'
            ? 'bg-[#e91e63] text-white shadow-sm'
            : 'text-muted hover:text-foreground'
        }`}
      >
        Dating
      </button>
      <button
        onClick={() => setMode('matrimony')}
        className={`flex-1 px-3 py-1.5 rounded-lg transition-all ${
          mode === 'matrimony'
            ? 'bg-[#d4a017] text-white shadow-sm'
            : 'text-muted hover:text-foreground'
        }`}
      >
        Matrimony
      </button>
    </div>
  )
}
