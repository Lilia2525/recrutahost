'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-[#FFD700] text-black hover:bg-[#FFC200] focus:ring-[#FFD700] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]',
      secondary:
        'bg-transparent border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10 focus:ring-[#FFD700]',
      ghost:
        'bg-transparent text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a] focus:ring-[#444]',
      danger:
        'bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444] hover:scale-[1.02]',
      success:
        'bg-[#22c55e] text-white hover:bg-[#16a34a] focus:ring-[#22c55e] hover:scale-[1.02]',
    }

    const sizes = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          icon
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
