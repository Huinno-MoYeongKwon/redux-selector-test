import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'warning' | 'success' | 'experiment' | 'benchmark'

const variantStyles: Record<CardVariant, string> = {
  default: 'border-border/50 bg-card/80',
  warning: 'border-l-2 border-l-warning border-t-border/50 border-r-border/50 border-b-border/50 bg-warning-muted/20',
  success: 'border-l-2 border-l-success border-t-border/50 border-r-border/50 border-b-border/50 bg-success-muted/20',
  experiment: 'border-l-2 border-l-experiment border-t-border/50 border-r-border/50 border-b-border/50 bg-experiment-muted/20',
  benchmark: 'border-l-2 border-l-benchmark border-t-border/50 border-r-border/50 border-b-border/50 bg-benchmark-muted/20',
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        'backdrop-blur-sm',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  )
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('text-xl font-semibold tracking-tight text-card-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('text-lg text-muted-foreground', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('pt-3', className)}
      {...props}
    />
  )
}
