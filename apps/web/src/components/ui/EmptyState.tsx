import { clsx } from 'clsx'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, subtitle, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      {icon && <div className="text-muted/40 mb-2">{icon}</div>}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {subtitle && <p className="text-sm text-muted max-w-xs">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
