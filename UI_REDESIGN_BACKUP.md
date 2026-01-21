# UI Redesign Backup - shadcn 스타일 모던 미니멀

## 개요
Redux Selector 테스트 프로젝트의 UI를 Tailwind CSS v4 + shadcn 디자인 시스템으로 개선
- 다크 모드 토글 추가
- 모던 미니멀 스타일 적용

---

## 설치된 패키지

```bash
pnpm add -D tailwindcss @tailwindcss/vite
pnpm add clsx tailwind-merge lucide-react
```

---

## 파일 구조

```
src/
├── lib/
│   └── utils.ts                 # cn() 유틸리티
├── contexts/
│   └── ThemeContext.tsx         # 테마 상태 관리
├── components/
│   ├── ThemeToggle.tsx          # 테마 토글 버튼
│   └── ui/
│       ├── card.tsx             # Card 컴포넌트
│       ├── button.tsx           # Button 컴포넌트
│       ├── input.tsx            # Input 컴포넌트
│       ├── badge.tsx            # Badge 컴포넌트
│       └── stat-item.tsx        # StatItem 컴포넌트
├── index.css                    # Tailwind CSS v4 + 테마 변수
├── main.tsx                     # ThemeProvider 래핑
└── App.tsx                      # 메인 레이아웃
```

---

## 설정 파일

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### tsconfig.app.json (추가된 부분)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### index.html
```html
<html lang="ko" class="light">
```

---

## 테마 시스템

### src/index.css
```css
@import "tailwindcss";

@theme {
  /* Modern Minimal - Light */
  --color-background: #fafafa;
  --color-foreground: #18181b;
  --color-card: #ffffff;
  --color-card-foreground: #18181b;
  --color-primary: #18181b;
  --color-primary-foreground: #fafafa;
  --color-secondary: #f4f4f5;
  --color-secondary-foreground: #18181b;
  --color-muted: #f4f4f5;
  --color-muted-foreground: #71717a;
  --color-accent: #f4f4f5;
  --color-accent-foreground: #18181b;
  --color-border: #e4e4e7;
  --color-input: #e4e4e7;
  --color-ring: #18181b;

  /* Semantic Colors */
  --color-success: #10b981;
  --color-success-foreground: #ffffff;
  --color-success-muted: #d1fae5;
  --color-success-border: #6ee7b7;

  --color-warning: #f59e0b;
  --color-warning-foreground: #ffffff;
  --color-warning-muted: #fef3c7;
  --color-warning-border: #fcd34d;

  --color-info: #6366f1;
  --color-info-foreground: #ffffff;
  --color-info-muted: #e0e7ff;
  --color-info-border: #a5b4fc;

  --color-experiment: #8b5cf6;
  --color-experiment-foreground: #ffffff;
  --color-experiment-muted: #ede9fe;
  --color-experiment-border: #c4b5fd;

  --color-benchmark: #06b6d4;
  --color-benchmark-foreground: #ffffff;
  --color-benchmark-muted: #cffafe;
  --color-benchmark-border: #67e8f9;

  /* Radius */
  --radius-lg: 1rem;
  --radius-md: 0.75rem;
  --radius-sm: 0.5rem;
}

.dark {
  --color-background: #09090b;
  --color-foreground: #fafafa;
  --color-card: #18181b;
  --color-card-foreground: #fafafa;
  --color-primary: #fafafa;
  --color-primary-foreground: #18181b;
  --color-secondary: #27272a;
  --color-secondary-foreground: #fafafa;
  --color-muted: #27272a;
  --color-muted-foreground: #a1a1aa;
  --color-accent: #27272a;
  --color-accent-foreground: #fafafa;
  --color-border: #27272a;
  --color-input: #27272a;
  --color-ring: #fafafa;

  /* Semantic Colors - Dark */
  --color-success: #34d399;
  --color-success-foreground: #022c22;
  --color-success-muted: #064e3b;
  --color-success-border: #059669;

  --color-warning: #fbbf24;
  --color-warning-foreground: #422006;
  --color-warning-muted: #78350f;
  --color-warning-border: #d97706;

  --color-info: #818cf8;
  --color-info-foreground: #1e1b4b;
  --color-info-muted: #312e81;
  --color-info-border: #4f46e5;

  --color-experiment: #a78bfa;
  --color-experiment-foreground: #2e1065;
  --color-experiment-muted: #4c1d95;
  --color-experiment-border: #7c3aed;

  --color-benchmark: #22d3ee;
  --color-benchmark-foreground: #083344;
  --color-benchmark-muted: #164e63;
  --color-benchmark-border: #0891b2;
}

/* Base Styles */
* {
  border-color: var(--color-border);
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-muted-foreground); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-foreground); }

/* Selection */
::selection {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}
```

---

## 유틸리티

### src/lib/utils.ts
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 테마 컨텍스트

### src/contexts/ThemeContext.tsx
```typescript
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
const STORAGE_KEY = 'redux-selector-test-theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    return 'light'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'system') return getSystemTheme()
    return theme
  })

  useEffect(() => {
    const root = document.documentElement
    const updateTheme = () => {
      const resolved = theme === 'system' ? getSystemTheme() : theme
      setResolvedTheme(resolved)
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }
    updateTheme()
    localStorage.setItem(STORAGE_KEY, theme)

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => updateTheme()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
```

---

## UI 컴포넌트

### src/components/ThemeToggle.tsx
```typescript
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
```

### src/components/ui/card.tsx
```typescript
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
  return <div className={cn('flex flex-col space-y-2', className)} {...props} />
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-bold tracking-tight text-card-foreground', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-base text-muted-foreground leading-relaxed', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('pt-6', className)} {...props} />
}
```

### src/components/ui/button.tsx
```typescript
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

export function Button({ className, variant = 'default', disabled, ...props }: ButtonProps) {
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
```

### src/components/ui/input.tsx
```typescript
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, type = 'text', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2',
        'text-sm font-mono',
        'transition-colors duration-200',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}
```

### src/components/ui/badge.tsx
```typescript
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
        'inline-flex items-center rounded-md px-3 py-1.5 text-base font-bold font-mono tabular-nums',
        'transition-colors duration-200',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
```

### src/components/ui/stat-item.tsx
```typescript
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

export function StatItem({ label, value, description, variant = 'default', className }: StatItemProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 min-w-[110px]', className)}>
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
```

---

## 삭제된 파일
- `src/App.css` (더 이상 필요 없음)

---

## 디자인 특징

### 컬러 팔레트
- **Light**: Zinc 기반 뉴트럴 (#fafafa, #18181b)
- **Dark**: 깊은 블랙 (#09090b, #18181b)
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Info**: Indigo (#6366f1)
- **Experiment**: Violet (#8b5cf6)
- **Benchmark**: Cyan (#06b6d4)

### 타이포그래피
- 헤더: text-2xl font-bold
- 카드 제목: text-xl font-bold
- 본문: text-base
- Badge 값: text-lg font-bold font-mono
- 버튼: text-base font-semibold

### 인터랙션
- 버튼 클릭: active:scale-[0.98]
- 카드 호버: hover:shadow-md
- 테마 전환: transition 0.2s

---

## 검증 방법

```bash
pnpm dev
```

1. 라이트/다크 모드 토글 동작 확인
2. 모든 버튼 동작 확인
3. Case 1-7 렌더 카운트 정상 동작 확인
4. Case 6 runDraftProbe 로그 표시 확인
5. Case 7 벤치마크 실행 및 결과 테이블 표시 확인

---

# 세션 2 - 추가 개선 사항

## 1. Sticky 컨트롤 패널

### 문제
- 컨트롤 버튼들이 페이지 상단에만 있어서 Case 3 이후 스크롤 시 접근 불편

### 해결
- 헤더와 컨트롤 영역을 하나의 sticky 그룹으로 통합
- `sticky top-0 z-50`으로 스크롤해도 항상 상단 고정

### App.tsx 구조 변경
```tsx
<div className="sticky top-0 z-50">
  {/* Header */}
  <header className="border-b border-border bg-background/95 backdrop-blur-sm">
    ...
  </header>

  {/* Controls */}
  <div className="border-b border-border bg-background/95 backdrop-blur-sm">
    ...
  </div>
</div>

<main>
  {/* Cases */}
</main>
```

---

## 2. Button 컴포넌트 size prop 추가

### src/components/ui/button.tsx
```typescript
type ButtonSize = 'sm' | 'default' | 'lg'

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  default: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold cursor-pointer',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.98]',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
}
```

---

## 3. ESLint 에러 수정

### 에러 목록 (총 21개)
| 파일 | 규칙 | 설명 |
|------|------|------|
| Case1-6.tsx | react-hooks/refs | 렌더링 중 ref 접근/수정 |
| useTimedSelector.ts | react-hooks/purity | 렌더링 중 performance.now() 호출 |
| ThemeContext.tsx | react-refresh/only-export-components | 컴포넌트와 훅 함께 export |

### 해결 방법: eslint-disable 주석 추가
프로젝트 목적상 의도된 동작이므로 해당 라인에 eslint-disable 주석 추가

#### Case1-6.tsx
```tsx
// eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 추적
renderCount.current += 1;

// JSX에서도
{/* eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 표시 */}
<StatItem label="Render" value={renderCount.current} variant="info" />
```

#### useTimedSelector.ts
```typescript
/* eslint-disable react-hooks/purity -- 벤치마크 목적으로 의도적 사용 */
const start = performance.now();
selector(state);
const end = performance.now();
/* eslint-enable react-hooks/purity */
```

#### ThemeContext.tsx
```typescript
// eslint-disable-next-line react-refresh/only-export-components -- Provider와 hook을 함께 export하는 것이 일반적인 패턴
export function useTheme() {
```

---

## 4. 상태 구조 및 버튼 설명 추가

### App.tsx - 컨트롤 영역 하단에 정보 섹션 추가
```tsx
{/* Info */}
<div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
  {/* 상태 구조 */}
  <div className="space-y-1">
    <div>
      <span className="font-semibold text-foreground">items:</span>
      <code className="ml-1 px-1.5 py-0.5 bg-muted rounded font-mono">
        {'{ id: number, value: number }[]'}
      </code>
    </div>
    <div>
      <span className="font-semibold text-foreground">tick:</span>
      <span className="ml-1">items와 무관한 카운터 (리렌더 테스트용)</span>
    </div>
  </div>
  {/* 버튼 설명 */}
  <div className="space-y-1">
    <div><span className="font-semibold text-foreground">bumpTick</span>: tick += 1 (items 불변)</div>
    <div><span className="font-semibold text-foreground">mutateOneItem</span>: items[0].value += 1</div>
    <div><span className="font-semibold text-foreground">toggleFilter</span>: 짝수만 필터 on/off</div>
    <div><span className="font-semibold text-foreground">runDraftProbe</span>: draft에서 selector 캐시 테스트</div>
  </div>
</div>
```

### 표시 내용
```
상태 구조:
  items: { id: number, value: number }[]
  tick: items와 무관한 카운터 (리렌더 테스트용)

버튼 설명:
  bumpTick: tick += 1 (items 불변)
  mutateOneItem: items[0].value += 1
  toggleFilter: 짝수만 필터 on/off
  runDraftProbe: draft에서 selector 캐시 테스트
```

---

## 최종 상태

- ESLint: 0 errors, 0 warnings
- TypeScript: 통과
- Build: 성공

```bash
pnpm build
# ✓ built in 1.32s
```
