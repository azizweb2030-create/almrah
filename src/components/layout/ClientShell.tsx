'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href:'/dashboard',     icon:'🏠', label:'الرئيسية' },
  { href:'/births',        icon:'🐑', label:'الولادات' },
  { href:'/production',      icon:'📋', label:'الإنتاج' },
  { href:'/flock',         icon:'📊', label:'القطيع' },
  { href:'/vet',           icon:'🩺', label:'البيطرة' },
  { href:'/deaths',        icon:'📋', label:'النفوق' },
  { href:'/reports',       icon:'📈', label:'التقارير' },
  { href:'/ai',            icon:'🤖', label:'المساعد' },
  { href:'/subscriptions', icon:'💳', label:'اشتراكي' },
  { href:'/support',       icon:'🎫', label:'الدعم' },
  { href:'/settings',      icon:'⚙️', label:'الإعدادات' },
]

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      // فحص الأدمن
      sb.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => setIsAdmin(data?.role === 'admin'))
      // عدد الإشعارات غير المقروءة
      sb.from('notifications').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('dismissed', false)
        .then(({ count }) => setUnread(count || 0))
    })
  }, [])

  function active(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-beige-primary">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-40 bg-white/90 backdrop-blur border-b border-beige-border h-14 flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-beige-dark text-lg">☰</button>
        <Link href="/dashboard" className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">🐑</span>
          <span className="font-black text-green-primary text-lg truncate">المراح</span>
        </Link>
        <Link href="/search" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-beige-dark">🔍</Link>
        <Link href="/notifications" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-beige-dark relative">
          🔔
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
        {isAdmin && <Link href="/admin" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-beige-dark">🛡️</Link>}
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex fixed top-0 right-0 bottom-0 w-56 flex-col border-l border-beige-border bg-white z-30 pt-14">
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-hide">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active(item.href) ? 'bg-green-subtle text-green-primary' : 'text-gray-600 hover:bg-beige-primary')}>
              <span className="w-5 text-center text-base">{item.icon}</span>
              <span>{item.label}</span>
              {item.href==='/notifications' && unread>0 && (
                <span className="mr-auto bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{unread}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-beige-border">
          <p className="text-[10px] text-gray-400 text-center">المراح V2</p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-beige-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐑</span>
                <span className="font-black text-green-primary text-lg">المراح</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 text-xl hover:text-gray-600">✕</button>
            </div>
            <nav className="flex-1 py-2 px-2 overflow-y-auto">
              {NAV.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={cn('flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium mb-0.5 transition-colors',
                    active(item.href) ? 'bg-green-subtle text-green-primary' : 'text-gray-600 hover:bg-beige-primary')}>
                  <span className="w-5 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.href==='/notifications' && unread>0 && (
                    <span className="mr-auto bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>
                  )}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-beige-primary">
                  <span className="w-5 text-center">🛡️</span><span>لوحة الإدارة</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="lg:mr-56 pt-14 min-h-screen">
        <div className="p-4 pb-24 lg:pb-6 max-w-4xl mx-auto">{children}</div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="lg:hidden fixed bottom-0 right-0 left-0 z-40 bg-white/90 backdrop-blur border-t border-beige-border">
        <div className="flex items-center justify-around h-16 px-1">
          {[NAV[0], NAV[1], NAV[3], NAV[5], NAV[6]].map(item => (
            <Link key={item.href} href={item.href}
              className={cn('flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-12 relative',
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
