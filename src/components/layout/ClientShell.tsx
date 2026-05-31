'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href:'/dashboard',     icon:'🏠', label:'الرئيسية' },
  { href:'/births',        icon:'🐑', label:'الولادات' },
  { href:'/production',    icon:'📋', label:'الإنتاج' },
  { href:'/flock',         icon:'📊', label:'القطيع' },
  { href:'/vet',           icon:'🩺', label:'البيطرة' },
  { href:'/deaths',        icon:'📋', label:'النفوق' },
  { href:'/reports',       icon:'📈', label:'التقارير' },
  { href:'/ai',            icon:'🤖', label:'المساعد' },
  { href:'/subscriptions', icon:'💳', label:'اشتراكي' },
  { href:'/support',       icon:'🎫', label:'الدعم' },
  { href:'/settings',      icon:'⚙️', label:'الإعدادات' },
]

const G = '#1e5a10'
const GSUBT = '#e8f5e2'
const BEIGE = '#f8f4ee'
const BDARK = '#ede7db'
const BDR = '#d8cfc3'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      sb.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => setIsAdmin(data?.role === 'admin'))
      sb.from('notifications').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('dismissed', false)
        .then(({ count }) => setUnread(count || 0))
    })
  }, [])

  const active = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <div style={{ minHeight:'100vh', backgroundColor: BEIGE }}>
      {/* Header */}
      <header style={{
        position:'fixed', top:0, right:0, left:0, zIndex:40,
        background:'rgba(255,255,255,0.92)', backdropFilter:'blur(8px)',
        borderBottom:`1px solid ${BDR}`, height:56,
        display:'flex', alignItems:'center', padding:'0 16px', gap:12
      }}>
        <button onClick={() => setOpen(true)} className="lg:hidden"
          style={{ width:36, height:36, borderRadius:10, border:'none', background:'transparent', fontSize:20, cursor:'pointer' }}>
          ☰
        </button>
        <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:8, flex:1, textDecoration:'none' }}>
          <span style={{ fontSize:22 }}>🐑</span>
          <span style={{ fontWeight:900, color:G, fontSize:18 }}>المراح</span>
        </Link>
        <Link href="/search" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>🔍</Link>
        <Link href="/notifications" style={{ position:'relative', width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
          🔔
          {unread > 0 && (
            <span style={{
              position:'absolute', top:2, right:2, width:16, height:16,
              background:'#ef4444', borderRadius:'50%', color:'white',
              fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center'
            }}>{unread > 9 ? '9+' : unread}</span>
          )}
        </Link>
        {isAdmin && <Link href="/admin" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>🛡️</Link>}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex" style={{
        position:'fixed', top:0, right:0, bottom:0, width:220,
        flexDirection:'column', borderLeft:`1px solid ${BDR}`,
        background:'white', zIndex:30, paddingTop:56
      }}>
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={{
              display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:12,
              textDecoration:'none', fontSize:14, fontWeight:500, transition:'all .15s',
              background: active(item.href) ? GSUBT : 'transparent',
              color: active(item.href) ? G : '#4b5563',
            }}>
              <span style={{ width:20, textAlign:'center' }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.href==='/notifications' && unread > 0 && (
                <span style={{ marginRight:'auto', background:'#ef4444', color:'white', borderRadius:'50%', width:16, height:16, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{unread}</span>
              )}
            </Link>
          ))}
        </nav>
        <div style={{ padding:'12px', borderTop:`1px solid ${BDR}`, textAlign:'center' }}>
          <p style={{ fontSize:10, color:'#9ca3af' }}>المراح V2</p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={() => setOpen(false)}/>
          <div style={{ position:'relative', width:280, background:'white', height:'100%', display:'flex', flexDirection:'column', boxShadow:'0 0 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', borderBottom:`1px solid ${BDR}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span>🐑</span>
                <span style={{ fontWeight:900, color:G, fontSize:18 }}>المراح</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#6b7280' }}>✕</button>
            </div>
            <nav style={{ flex:1, padding:'8px', overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
              {NAV.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:12,
                  textDecoration:'none', fontSize:14, fontWeight:500,
                  background: active(item.href) ? GSUBT : 'transparent',
                  color: active(item.href) ? G : '#4b5563',
                }}>
                  <span>{item.icon}</span><span>{item.label}</span>
                  {item.href==='/notifications' && unread > 0 && (
                    <span style={{ marginRight:'auto', background:'#ef4444', color:'white', borderRadius:'50%', width:16, height:16, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{unread}</span>
                  )}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:12,
                  textDecoration:'none', fontSize:14, fontWeight:500, color:'#4b5563'
                }}>
                  <span>🛡️</span><span>لوحة الإدارة</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ paddingTop:56, minHeight:'100vh' }} className="lg:mr-[220px]">
        <div style={{ padding:'16px', paddingBottom:96, maxWidth:900, margin:'0 auto' }} className="lg:pb-6">
          {children}
        </div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="lg:hidden" style={{
        position:'fixed', bottom:0, right:0, left:0, zIndex:40,
        background:'rgba(255,255,255,0.92)', backdropFilter:'blur(8px)',
        borderTop:`1px solid ${BDR}`, height:64,
        display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 4px'
      }}>
        {[NAV[0], NAV[1], NAV[4], NAV[6], NAV[7]].map(item => (
          <Link key={item.href} href={item.href} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            padding:'6px 8px', borderRadius:12, minWidth:48, textDecoration:'none',
            color: active(item.href) ? G : '#9ca3af'
          }}>
            <span style={{ fontSize:22 }}>{item.icon}</span>
            <span style={{ fontSize:9, fontWeight:500 }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
