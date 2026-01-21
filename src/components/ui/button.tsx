import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'experiment' | 'benchmark'

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  primary: 'bg-info text-info-foreground hover:bg-info/90',
  secondary: 'bg-warning text-warning-foreground hover:bg-warning/90',
  outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  success: 'bg-success text-success-foreground hover:bg-success/90',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
  experiment: 'bg-experiment text-experiment-foreground hover:bg-experiment/90',
  benchmark: 'bg-benchmark text-benchmark-foreground hover:bg-benchmark/90',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({
  className,
  variant = 'default',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold cursor-pointer',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.98]',
        variantStyles[variant],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
}
