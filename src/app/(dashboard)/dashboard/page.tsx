'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const G = '#1e5a10'
const GOLD = '#c9a84c'
const GOLDD = '#a8872e'
const GOLDS = '#fdf8ec'
const GSUBT = '#e8f5e2'
const BEIGE = '#f8f4ee'
const BDR = '#d8cfc3'

const card: React.CSSProperties = { background:'white', borderRadius:20, border:`1px solid ${BDR}`, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }
const cardHover: React.CSSProperties = { ...card, cursor:'pointer', textDecoration:'none', display:'block' }

export default function DashboardPage() {
  const [flock, setFlock] = useState<any>(null)
  const [births, setBirths] = useState<any[]>([])
  const [vet, setVet] = useState<any[]>([])
  const [stats, setStats] = useState({ bahm:0, rakhalWean:0, rakhalReady:0, kharafSale:0, breeding:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r=>r.json()),
      fetch('/api/births').then(r=>r.json()),
      fetch('/api/vet/isolation').then(r=>r.json()),
    ]).then(([f, b, v]) => {
      setFlock(f.data)
      const allBirths: any[] = b.data || []
      setBirths(allBirths.slice(0, 5))
      setVet((v.data || []).filter((c:any) => c.active).slice(0, 5))
      const now = new Date()
      let bahm=0, rakhalWean=0, rakhalReady=0, kharafSale=0
      allBirths.forEach((r:any) => {
        const bd = r.original_birth_date || r.birth_date
        const months = bd ? (now.getTime()-new Date(bd).getTime())/(1000*60*60*24*30.44) : 0
        ;(r.babies||[]).forEach((b:any) => {
          if (b.health==='نفوق') return
          if (!b.stage && months<3) bahm++
          if (b.gender==='رخل') {
            if (b.stage==='مفطوم'||(!b.stage&&months>=3&&months<7)) rakhalWean++
            if (b.stage==='جاهز للإنتاج'||(!b.stage&&months>=7)) rakhalReady++
          } else {
            if (b.stage==='جاهز للبيع'||(!b.stage&&months>=3)) kharafSale++
          }
        })
      })
      const breeding = allBirths.filter((r:any) => r.in_breeding).length
      setStats({ bahm, rakhalWean, rakhalReady, kharafSale, breeding })
      setLoading(false)
      fetch('/api/babies/stages', { method:'POST' }).catch(()=>{})
    })
  }, [])

  const upcoming = births.filter((b:any) => b.in_breeding && b.breeding_date).map((b:any) => {
    const bd = new Date(b.breeding_date); bd.setDate(bd.getDate()+150)
    const daysLeft = Math.ceil((bd.getTime()-Date.now())/(1000*60*60*24))
    return { ...b, daysLeft, expectedDate: bd.toISOString().split('T')[0] }
  }).filter((b:any) => b.daysLeft>=0 && b.daysLeft<=30).sort((a:any,b:any) => a.daysLeft-b.daysLeft)

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <h1 style={{ fontSize:24, fontWeight:900, color:G }}>🐑 لوحة المتابعة</h1>
      {[...Array(4)].map((_,i) => (
        <div key={i} style={{ height:80, borderRadius:20, background:`linear-gradient(90deg,${BDR} 25%,${BEIGE} 50%,${BDR} 75%)`, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
      ))}
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h1 style={{ fontSize:24, fontWeight:900, color:G, margin:0 }}>🐑 لوحة المتابعة</h1>
        <span style={{ background:GSUBT, color:G, borderRadius:100, padding:'3px 10px', fontSize:12, fontWeight:600 }}>نشط</span>
      </div>

      {/* إجمالي + شبك + معزول */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        {[
          { l:'الإجمالي', v:flock?.total_sheep||0, icon:'🐑', c:G },
          { l:'في الشبك', v:stats.breeding, icon:'🔗', c:GOLDD },
          { l:'معزول', v:vet.length, icon:'🩺', c:'#dc2626' },
        ].map(s => (
          <div key={s.l} style={{ ...card, textAlign:'center', display:'flex', flexDirection:'column', gap:4, alignItems:'center' }}>
            <span style={{ fontSize:24 }}>{s.icon}</span>
            <span style={{ fontSize:28, fontWeight:900, color:s.c, lineHeight:1 }}>{s.v}</span>
            <span style={{ fontSize:12, color:'#6b7280' }}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* مراحل المواليد */}
      {(stats.bahm+stats.rakhalWean+stats.rakhalReady+stats.kharafSale) > 0 && (
        <div style={card}>
          <p style={{ fontSize:12, fontWeight:700, color:'#6b7280', margin:'0 0 12px' }}>📊 تصنيف المواليد</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              { l:'البهم', v:stats.bahm, icon:'🍼', c:'#2563eb' },
              { l:'رخال مفطومة', v:stats.rakhalWean, icon:'🔔', c:'#d97706' },
              { l:'رخال جاهزة للإنتاج', v:stats.rakhalReady, icon:'🌿', c:G },
              { l:'خرفان جاهزة للبيع', v:stats.kharafSale, icon:'🏷️', c:'#7c3aed' },
            ].map(s => (
              <div key={s.l} style={{ background:BEIGE, borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:s.c, lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* أزرار سريعة */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[
          { href:'/births/new', icon:'➕', label:'تسجيل ولادة', bg:GSUBT, color:G },
          { href:'/vet/isolation/new', icon:'🩺', label:'عزل بيطري', bg:'#eff6ff', color:'#1d4ed8' },
          { href:'/deaths/new', icon:'📋', label:'تسجيل نفوق', bg:'#fef2f2', color:'#dc2626' },
          { href:'/ai', icon:'🤖', label:'مساعد AI', bg:'#faf5ff', color:'#7c3aed' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{
            background:a.bg, borderRadius:20, padding:'12px 16px',
            display:'flex', alignItems:'center', gap:12, textDecoration:'none',
            border:`1px solid ${a.color}22`
          }}>
            <span style={{ fontSize:26 }}>{a.icon}</span>
            <span style={{ fontSize:14, fontWeight:600, color:a.color }}>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* ولادات قريبة */}
      {upcoming.length > 0 && (
        <div>
          <h2 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px' }}>⏰ ولادات قريبة</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {upcoming.map((b:any) => (
              <Link key={b.id} href={`/births/${b.id}`} style={{ ...cardHover, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ margin:0, fontWeight:600, fontSize:14 }}>الأم: {b.mom_id}{b.mom_color?` · ${b.mom_color}`:''}</p>
                  <p style={{ margin:'2px 0 0', fontSize:12, color:'#6b7280' }}>المتوقع: {b.expectedDate}</p>
                </div>
                <div style={{ textAlign:'center', padding:'6px 12px', borderRadius:12, fontWeight:700, fontSize:14,
                  background:b.daysLeft<=7?'#fef2f2':GOLDS, color:b.daysLeft<=7?'#dc2626':GOLDD }}>
                  {b.daysLeft}<div style={{ fontSize:10, fontWeight:400 }}>يوم</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'grid', gap:16 }} className="sm:grid-cols-2">
        {/* آخر الولادات */}
        <div>
          <h2 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px' }}>🐑 آخر الولادات</h2>
          {births.length===0 ? (
            <div style={{ ...card, textAlign:'center', padding:'32px', color:'#9ca3af', fontSize:14 }}>لا سجلات</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {births.map((b:any) => {
                const alive = (b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length
                return (
                  <Link key={b.id} href={`/births/${b.id}`} style={{ ...cardHover, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <p style={{ margin:0, fontWeight:600, fontSize:14 }}>الأم: {b.mom_id}{b.mom_color?` · ${b.mom_color}`:''}</p>
                      <p style={{ margin:'2px 0 0', fontSize:12, color:'#6b7280' }}>{b.birth_date}</p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ background:GSUBT, color:G, borderRadius:100, padding:'2px 8px', fontSize:11, fontWeight:600 }}>{alive} حي</span>
                      {b.in_breeding && <span style={{ background:GOLDS, color:GOLDD, borderRadius:100, padding:'2px 8px', fontSize:11, fontWeight:600 }}>🔗</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* العزل النشط */}
        <div>
          <h2 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px' }}>🩺 العزل النشط</h2>
          {vet.length===0 ? (
            <div style={{ ...card, textAlign:'center', padding:'32px', color:'#9ca3af', fontSize:14 }}>لا حالات</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {vet.map((v:any) => (
                <Link key={v.id} href={`/vet/isolation/${v.id}`} style={{ ...cardHover, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ margin:0, fontWeight:600, fontSize:14 }}>{v.animal_id}</p>
                    <p style={{ margin:'2px 0 0', fontSize:12, color:'#6b7280' }}>{v.disease||v.status}</p>
                  </div>
                  <span style={{ background:'#fef2f2', color:'#dc2626', borderRadius:100, padding:'2px 8px', fontSize:11, fontWeight:600 }}>نشط</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
