'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/candidatos': 'Candidatos',
  '/ofertas': 'Ofertas de Trabajo',
  '/configuracion': 'Configuración',
}

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path)) return title
  }
  return 'RecrutaHost'
}

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: any }) => setUser(data.user))
  }, [])

  const title = getPageTitle(pathname)
  const displayName = user?.user_metadata?.restaurant_name ?? user?.email ?? ''

  return (
    <header className="h-16 bg-[#111111] border-b border-[#1f1f1f] flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-white font-semibold text-lg">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-[#6b7280] hover:text-white hover:bg-[#1a1a1a] transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <Avatar name={displayName} size="sm" />
          {displayName && (
            <span className="text-sm text-[#a0a0a0] max-w-[140px] truncate hidden sm:block">
              {displayName}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
