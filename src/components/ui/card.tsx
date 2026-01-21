import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'warning' | 'success' | 'experiment' | 'benchmark'

const variantStyles: Record<CardVariant, string> = {
  default: 'border-border bg-card',
  warning: 'border-l-4 border-l-warning border-y-border border-r-border bg-card',
  success: 'border-l-4 border-l-success border-y-border border-r-border bg-card',
  experiment: 'border-l-4 border-l-experiment border-y-border border-r-border bg-card',
  benchmark: 'border-l-4 border-l-benchmark border-y-border border-r-border bg-card',
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-6',
        'shadow-sm transition-shadow duration-200',
        'hover:shadow-md',
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
      className={cn('flex flex-col space-y-2', className)}
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
      className={cn('text-xl font-bold tracking-tight text-card-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('text-base text-muted-foreground leading-relaxed', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('pt-6', className)}
      {...props}
    />
  )
}
