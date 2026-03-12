import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ─── TEXT INPUT ───────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#e0e0e0]">
          {label}
          {props.required && <span className="text-[#FFD700] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]">{icon}</span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-white placeholder-[#4a4a4a]',
            'px-3 py-2.5 text-sm transition-colors',
            'focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            icon && 'pl-10',
            error && 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/30',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#6b7280]">{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── TEXTAREA ─────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#e0e0e0]">
          {label}
          {props.required && <span className="text-[#FFD700] ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-white placeholder-[#4a4a4a]',
          'px-3 py-2.5 text-sm transition-colors resize-vertical min-h-[100px]',
          'focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/30',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#6b7280]">{hint}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─── SELECT ───────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#e0e0e0]">
          {label}
          {props.required && <span className="text-[#FFD700] ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-white',
          'px-3 py-2.5 text-sm transition-colors appearance-none',
          'focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-[#ef4444]',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-[#1a1a1a]">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#6b7280]">{hint}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ─── TOGGLE / SWITCH ──────────────────────────────────────────
interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={cn(
            'w-11 h-6 rounded-full transition-colors',
            checked ? 'bg-[#FFD700]' : 'bg-[#2a2a2a]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <div
          className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </div>
      {label && <span className="text-sm text-[#e0e0e0]">{label}</span>}
    </label>
  )
}
