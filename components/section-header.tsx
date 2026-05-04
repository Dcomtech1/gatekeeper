import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow: string
  title: string
  subtitle?: React.ReactNode
  /** Renders a live blinking dot beside the eyebrow label */
  live?: boolean
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  live = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(className)}>
      <div className="flex items-center gap-3 mb-1">
        {live && (
          <div className="size-2 bg-admitted animate-blink" aria-hidden="true" />
        )}
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal">
          {eyebrow}
        </p>
      </div>
      <h2 className="font-display text-4xl uppercase text-foreground leading-none">
        {title}
      </h2>
      {subtitle && (
        <p className="font-mono text-xs text-foreground/70 uppercase tracking-widest mt-2">
          {subtitle}
        </p>
      )}
    </div>
  )
}
