import { clsx } from 'clsx'
import { initials } from '@/lib/utils/format'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClass = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={clsx(
        'rounded-full overflow-hidden bg-surface-strong flex items-center justify-center font-semibold text-accent shrink-0',
        sizeClass[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ''} className="w-full h-full object-cover" />
      ) : (
        <span>{initials(name ?? null)}</span>
      )}
    </div>
  )
}
