import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'py-20 border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-foreground/20" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="font-display text-2xl uppercase text-foreground/30 mb-1">
        {title}
      </p>
      {subtitle && (
        <p className="font-mono text-xs text-foreground/30 uppercase tracking-widest">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
