'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import type { AppMode } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'

interface ModeContextValue {
  mode: AppMode
  setMode: (m: AppMode) => void
}

const ModeContext = createContext<ModeContextValue>({ mode: 'dating', setMode: () => {} })

export function ModeProvider({
  children,
  initialMode,
}: {
  children: React.ReactNode
  initialMode?: AppMode | null
}) {
  const [mode, setModeState] = useState<AppMode>(initialMode ?? 'dating')
  const supabase = createClient()

  useEffect(() => {
    document.documentElement.dataset.mode = mode
  }, [mode])

  useEffect(() => {
    document.documentElement.dataset.mode = initialMode ?? 'dating'
  }, [initialMode])

  const setMode = async (m: AppMode) => {
    setModeState(m)
    document.documentElement.dataset.mode = m
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({ preferred_mode: m }).eq('id', user.id)
    }
  }

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  return useContext(ModeContext)
}
