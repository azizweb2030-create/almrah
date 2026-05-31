'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href:'/dashboard',     icon:'🏠', label:'الرئيسية' },
  { href:'/births',        icon:'🐑', label:'الولادات' },
  { href:'/production',    icon:'📋', label:'الإنتاج'  },
  { href:'/flock',         icon:'📊', label:'القطيع'   },
  { href:'/vet',           icon:'🩺', label:'البيطرة'  },
  { href:'/deaths',        icon:'💀', label:'النفوق'   },
  { href:'/reports',       icon:'📈', label:'التقارير' },
  { href:'/ai',            icon:'🤖', label:'المساعد'  },
  { href:'/subscriptions', icon:'💳', label:'اشتراكي'  },
  { href:'/support',       icon:'🎫', label:'الدعم'    },
  { href:'/settings',      icon:'⚙️', label:'الإعدادات'},
]

const BOTTOM_NAV = [NAV[0], NAV[1], NAV[4], NAV[3], NAV[7]]

const G = '#1e5a10', GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDARK = '#ede7db', BDR = '#d8cfc3'

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
      sb.from('notifications').select('id', { count:'exact', head:true })
        .eq('user_id', user.id).eq('dismissed', false)
        .then(({ count }) => setUnread(count || 0))
    })
  }, [pathname])

  const active = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <div style={{minHeight:'100vh',backgroundColor:BEIGE}}>

      {/* ── Header ── */}
      <header style={{
        position:'fixed',top:0,right:0,left:0,zIndex:40,
        background:'rgba(255,255,255,0.94)',backdropFilter:'blur(12px)',
        borderBottom:`1px solid ${BDR}`,height:56,
        display:'flex',alignItems:'center',padding:'0 16px',gap:12,
        boxShadow:'0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <button onClick={()=>setOpen(true)} className="lg:hidden"
          style={{width:36,height:36,borderRadius:10,border:'none',background:BDARK,fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          ☰
        </button>
        <Link href="/dashboard" style={{display:'flex',alignItems:'center',gap:8,flex:1,textDecoration:'none'}}>
          <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${G},#c9a84c)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🐑</div>
          <span style={{fontWeight:900,color:G,fontSize:18,letterSpacing:-0.3}}>المراح</span>
        </Link>
        <Link href="/search" style={{width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',background:BDARK,fontSize:16}}>🔍</Link>
        <Link href="/notifications" style={{position:'relative',width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',background:BDARK,fontSize:16}}>
          🔔
          {unread > 0 && (
            <span style={{position:'absolute',top:4,right:4,width:14,height:14,background:'#ef4444',borderRadius:'50%',color:'white',fontSize:8,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid white'}}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
        {isAdmin && (
          <Link href="/admin" style={{width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',background:'#fffbeb',fontSize:16}}>🛡️</Link>
        )}
      </header>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex" style={{
        position:'fixed',top:0,right:0,bottom:0,width:230,
        flexDirection:'column',borderLeft:`1px solid ${BDR}`,
        background:'white',zIndex:30,paddingTop:56
      }}>
        <nav style={{flex:1,padding:'12px 8px',overflowY:'auto',display:'flex',flexDirection:'column',gap:2}}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={{
              display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:12,
              textDecoration:'none',fontSize:14,fontWeight:500,transition:'all .15s',
              background: active(item.href) ? GSUBT : 'transparent',
              color: active(item.href) ? G : '#4b5563',
              fontWeight: active(item.href) ? 700 : 500,
            }}>
              <span style={{width:20,textAlign:'center',fontSize:16}}>{item.icon}</span>
              <span>{item.label}</span>
              {item.href==='/notifications' && unread > 0 && (
                <span style={{marginRight:'auto',background:'#ef4444',color:'white',borderRadius:100,padding:'1px 6px',fontSize:10,fontWeight:700}}>{unread}</span>
              )}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:12,textDecoration:'none',fontSize:14,fontWeight:500,color:'#4b5563',background:active('/admin')?'#fffbeb':'transparent'}}>
              <span style={{width:20,textAlign:'center'}}>🛡️</span>
              <span>الإدارة</span>
            </Link>
          )}
        </nav>
        <div style={{padding:'12px',borderTop:`1px solid ${BDR}`,textAlign:'center'}}>
          <p style={{fontSize:10,color:'#9ca3af',margin:0}}>المراح V2 · جميع الحقوق محفوظة</p>
        </div>
      </aside>

      {/* ── Mobile Drawer ── */}
      {open && (
        <div style={{position:'fixed',inset:0,zIndex:50,display:'flex'}}>
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(2px)'}} onClick={()=>setOpen(false)}/>
          <div style={{position:'relative',width:280,background:'white',height:'100%',display:'flex',flexDirection:'column',boxShadow:'0 0 40px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px',borderBottom:`1px solid ${BDR}`}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${G},#c9a84c)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🐑</div>
                <span style={{fontWeight:900,color:G,fontSize:18}}>المراح</span>
              </div>
              <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#6b7280'}}>✕</button>
            </div>
            <nav style={{flex:1,padding:'8px',overflowY:'auto',display:'flex',flexDirection:'column',gap:2}}>
              {NAV.map(item => (
                <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} style={{
                  display:'flex',alignItems:'center',gap:12,padding:'12px',borderRadius:12,
                  textDecoration:'none',fontSize:14,
                  background: active(item.href) ? GSUBT : 'transparent',
                  color: active(item.href) ? G : '#4b5563',
                  fontWeight: active(item.href) ? 700 : 500,
                }}>
                  <span style={{fontSize:18}}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.href==='/notifications' && unread > 0 && (
                    <span style={{marginRight:'auto',background:'#ef4444',color:'white',borderRadius:100,padding:'1px 6px',fontSize:10,fontWeight:700}}>{unread}</span>
                  )}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" onClick={()=>setOpen(false)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px',borderRadius:12,textDecoration:'none',fontSize:14,fontWeight:500,color:'#4b5563'}}>
                  <span>🛡️</span><span>الإدارة</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main style={{paddingTop:56,minHeight:'100vh'}} className="lg:mr-[230px]">
        <div style={{padding:'16px',paddingBottom:88,maxWidth:900,margin:'0 auto'}} className="lg:pb-8">
          {children}
        </div>
      </main>

      {/* ── Bottom Nav Mobile ── */}
      <nav className="lg:hidden" style={{
        position:'fixed',bottom:0,right:0,left:0,zIndex:40,
        background:'rgba(255,255,255,0.95)',backdropFilter:'blur(12px)',
        borderTop:`1px solid ${BDR}`,height:66,
        display:'flex',alignItems:'center',justifyContent:'space-around',
        boxShadow:'0 -2px 12px rgba(0,0,0,0.06)'
      }}>
        {BOTTOM_NAV.map(item => (
          <Link key={item.href} href={item.href} style={{
            display:'flex',flexDirection:'column',alignItems:'center',gap:3,
            padding:'6px 10px',borderRadius:14,minWidth:52,textDecoration:'none',
            color: active(item.href) ? G : '#9ca3af',
            background: active(item.href) ? GSUBT : 'transparent',
          }}>
            <span style={{fontSize:24,lineHeight:1}}>{item.icon}</span>
            <span style={{fontSize:9,fontWeight:active(item.href)?700:500}}>{item.label}</span>
          </Link>
        ))}
        <button onClick={()=>setOpen(true)} style={{
          display:'flex',flexDirection:'column',alignItems:'center',gap:3,
          padding:'6px 10px',borderRadius:14,minWidth:52,
          background:'none',border:'none',cursor:'pointer',
          color:'#9ca3af'
        }}>
          <span style={{fontSize:24,lineHeight:1}}>☰</span>
          <span style={{fontSize:9,fontWeight:500,fontFamily:'inherit'}}>المزيد</span>
        </button>
      </nav>
    </div>
  )
}
