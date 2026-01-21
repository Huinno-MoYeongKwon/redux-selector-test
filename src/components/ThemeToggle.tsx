import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const buttons = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ]

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
      {buttons.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center justify-center rounded-md p-2 transition-all duration-200 cursor-pointer',
            'hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          )}
          title={label}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </button>
      ))}
    </div>
  )
}
