'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href:'/dashboard',     icon:'🏠', label:'الرئيسية' },
  { href:'/births',        icon:'🐑', label:'الولادات' },
  { href:'/flock',         icon:'📊', label:'القطيع' },
  { href:'/vet',           icon:'🩺', label:'البيطرة' },
  { href:'/deaths',        icon:'📋', label:'النفوق' },
  { href:'/reports',       icon:'📈', label:'التقارير' },
  { href:'/ai',            icon:'🤖', label:'المساعد' },
  { href:'/subscriptions', icon:'💳', label:'اشتراكي' },
  { href:'/support',       icon:'🎫', label:'الدعم' },
  { href:'/settings',      icon:'⚙️', label:'الإعدادات' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) createClient().from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    })
  }, [])

  function active(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-beige-primary">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-40 bg-white/90 backdrop-blur border-b border-beige-border h-14 flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-beige-dark transition-colors">
          <span className="text-xl">☰</span>
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 flex-1">
          <span className="text-xl">🐑</span>
          <span className="font-black text-green-primary text-lg">المراح</span>
        </Link>
        <Link href="/search" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-beige-dark">🔍</Link>
        <Link href="/notifications" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-beige-dark">🔔</Link>
        {profile?.role === 'admin' && <Link href="/admin" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-beige-dark">🛡️</Link>}
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed top-0 right-0 bottom-0 w-56 flex-col border-l border-beige-border bg-white z-30 pt-14">
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-hide">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active(item.href) ? 'bg-green-subtle text-green-primary' : 'text-gray-600 hover:bg-beige-primary')}>
              <span className="w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        {profile && (
          <div className="p-3 border-t border-beige-border">
            <p className="text-xs font-medium text-gray-700 truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{profile.email}</p>
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-white h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-beige-border">
              <span className="font-black text-green-primary text-lg">🐑 المراح</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <nav className="flex-1 py-2 px-2 overflow-y-auto">
              {NAV.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={cn('flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium mb-0.5 transition-colors',
                    active(item.href) ? 'bg-green-subtle text-green-primary' : 'text-gray-600 hover:bg-beige-primary')}>
                  <span>{item.icon}</span><span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="lg:mr-56 pt-14 min-h-screen">
        <div className="p-4 pb-24 lg:pb-6 max-w-4xl mx-auto">{children}</div>
      </main>

      {/* Bottom nav mobile */}
      <nav className="lg:hidden fixed bottom-0 right-0 left-0 z-40 bg-white/90 backdrop-blur border-t border-beige-border">
        <div className="flex items-center justify-around h-16 px-1">
          {[NAV[0], NAV[1], NAV[3], NAV[5], NAV[6]].map(item => (
            <Link key={item.href} href={item.href}
              className={cn('flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-12',
                active(item.href) ? 'text-green-primary' : 'text-gray-400')}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
