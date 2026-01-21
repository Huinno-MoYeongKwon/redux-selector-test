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
        'flex items-center gap-2',
        className
      )}
    >
      <span className="text-lg text-muted-foreground">
        {label}
      </span>
      <Badge variant={variant}>
        {value}
      </Badge>
      {description && (
        <span className="text-lg text-muted-foreground">
          {description}
        </span>
      )}
    </div>
  )
}
