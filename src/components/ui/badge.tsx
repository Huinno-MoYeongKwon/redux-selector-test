import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'experiment' | 'benchmark'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  info: 'bg-info/15 text-info border border-info/30',
  experiment: 'bg-experiment/15 text-experiment border border-experiment/30',
  benchmark: 'bg-benchmark/15 text-benchmark border border-benchmark/30',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-3 py-1 text-lg font-semibold font-mono tabular-nums',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
