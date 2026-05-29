'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const NAV = [
  {href:'/admin',icon:'📊',label:'لوحة التحكم'},
  {href:'/admin/users',icon:'👥',label:'المستخدمون'},
  {href:'/admin/tickets',icon:'🎫',label:'التذاكر'},
  {href:'/admin/stats',icon:'📈',label:'الإحصائيات'},
  {href:'/admin/settings',icon:'⚙️',label:'الإعدادات'},
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 right-0 left-0 z-40 bg-gray-900 h-14 flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="lg:hidden text-white text-xl">☰</button>
        <Link href="/admin" className="font-black text-white text-lg flex-1">🛡️ الإدارة</Link>
        <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white">← التطبيق</Link>
      </header>

      <aside className="hidden lg:flex fixed top-0 right-0 bottom-0 w-52 flex-col bg-gray-900 z-30 pt-14">
        <nav className="flex-1 py-3 px-2">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-colors',
                pathname===item.href?'bg-white/10 text-white':'text-gray-400 hover:bg-white/5 hover:text-gray-200')}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)}/>
          <div className="relative w-64 bg-gray-900 h-full">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
              <span className="font-black text-white">🛡️ الإدارة</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <nav className="py-2 px-2">
              {NAV.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white mb-0.5">
                  <span>{item.icon}</span><span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main className="lg:mr-52 pt-14 min-h-screen">
        <div className="p-4 pb-8 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
