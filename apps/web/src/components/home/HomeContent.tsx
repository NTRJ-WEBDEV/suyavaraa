'use client'
import { useMode } from '@/components/layout/ModeProvider'
import { DatingDiscover } from './DatingDiscover'
import { MatrimonyBrowse } from './MatrimonyBrowse'

export function HomeContent({ userId }: { userId: string }) {
  const { mode } = useMode()
  return mode === 'matrimony' ? <MatrimonyBrowse userId={userId} /> : <DatingDiscover userId={userId} />
}
