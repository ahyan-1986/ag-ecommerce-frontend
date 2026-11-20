import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  loading?: boolean
  children: ReactNode
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function Button({ variant = 'primary', loading, children, className, disabled, ...props }: Props) {
  const base =
    variant === 'primary'   ? 'btn-primary'   :
    variant === 'danger'    ? 'btn-danger'     :
    variant === 'outline'   ? 'btn-outline'    :
    variant === 'ghost'     ? 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed' :
    'btn-secondary'
  return (
    <button className={cn(base, className)} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  )
}
