'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Star,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidatos', label: 'Candidatos', icon: Users },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
  { href: '/guia', label: 'Guía de inicio', icon: BookOpen },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('Sesión cerrada')
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-[#111111] border-r border-[#1f1f1f] transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-[#1f1f1f] flex-shrink-0',
          collapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center flex-shrink-0">
          <Star size={16} className="text-black" fill="black" />
        </div>
        {!collapsed && (
          <span className="font-bold text-white text-lg tracking-tight">RecrutaHost</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                isActive
                  ? 'bg-[#FFD700]/15 text-[#FFD700]'
                  : 'text-[#6b7280] hover:text-white hover:bg-[#1a1a1a]',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                size={20}
                className={cn(
                  'flex-shrink-0',
                  isActive ? 'text-[#FFD700]' : 'group-hover:text-white'
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-[#1f1f1f] space-y-1">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[#6b7280] hover:text-[#ef4444] hover:bg-[#1a1a1a] transition-colors',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Cerrar sesión</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[#4a4a4a] hover:text-[#6b7280] hover:bg-[#1a1a1a] transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? (
            <ChevronRight size={18} className="flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft size={18} className="flex-shrink-0" />
              <span className="text-sm">Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
