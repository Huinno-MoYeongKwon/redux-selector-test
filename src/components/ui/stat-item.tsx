import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Badge, type BadgeVariant } from './badge'

interface StatItemProps {
  label: string
  value: ReactNode
  description?: string
  variant?: BadgeVariant
  className?: string
}

export function StatItem({
  label,
  value,
  description,
  variant = 'default',
  className,
}: StatItemProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 min-w-[110px]',
        className
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Badge variant={variant} className="text-lg px-4 py-2">
        {value}
      </Badge>
      {description && (
        <span className="text-xs text-muted-foreground text-center max-w-[130px]">
          {description}
        </span>
      )}
    </div>
  )
}
