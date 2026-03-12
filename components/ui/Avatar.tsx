import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const AVATAR_COLORS = [
  ['#FFD700', '#1a1500'],
  ['#3b82f6', '#0d1f3c'],
  ['#22c55e', '#0a2e1a'],
  ['#8b5cf6', '#1e0f3c'],
  ['#ef4444', '#3c0f0f'],
  ['#FFA500', '#2e1a00'],
  ['#ec4899', '#3c0f2e'],
  ['#06b6d4', '#0a2e35'],
]

function getAvatarColor(name: string): [string, string] {
  const idx = (name && name.length > 0 ? name.charCodeAt(0) : 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx] as [string, string]
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name)
  const [fg, bg] = getAvatarColor(name)

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold flex-shrink-0',
        sizes[size],
        className
      )}
      style={{ backgroundColor: bg, color: fg, border: `1.5px solid ${fg}30` }}
    >
      {initials}
    </div>
  )
}
