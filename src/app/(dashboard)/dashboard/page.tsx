'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const G = '#1e5a10', GOLD = '#c9a84c', GOLDD = '#a8872e', GOLDS = '#fdf8ec'
const GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'

export default function DashboardPage() {
  const [flock, setFlock] = useState<any>(null)
  const [births, setBirths] = useState<any[]>([])
  const [vet, setVet] = useState<any[]>([])
  const [notifCount, setNotifCount] = useState(0)
  const [stats, setStats] = useState({ bahm:0, rakhalWean:0, rakhalReady:0, kharafSale:0, breeding:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r=>r.json()),
      fetch('/api/births').then(r=>r.json()),
      fetch('/api/vet/isolation').then(r=>r.json()),
      fetch('/api/notifications').then(r=>r.json()),
    ]).then(([f, b, v, n]) => {
      setFlock(f.data)
      const allBirths: any[] = b.data || []
      setBirths(allBirths.slice(0, 5))
      setVet((v.data || []).filter((c:any) => c.active).slice(0, 3))
      setNotifCount((n.data || []).filter((x:any)=>!x.dismissed).length)
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
      setStats({ bahm, rakhalWean, rakhalReady, kharafSale, breeding: allBirths.filter((r:any)=>r.in_breeding).length })
      setLoading(false)
      fetch('/api/babies/stages', { method:'POST' }).catch(()=>{})
    })
  }, [])

  const upcoming = births.filter((b:any) => b.in_breeding && b.breeding_date).map((b:any) => {
    const bd = new Date(b.breeding_date); bd.setDate(bd.getDate()+150)
    const daysLeft = Math.ceil((bd.getTime()-Date.now())/(1000*60*60*24))
    return { ...b, daysLeft, expectedDate: bd.toISOString().split('T')[0] }
  }).filter((b:any) => b.daysLeft>=0 && b.daysLeft<=30).sort((a:any,b:any)=>a.daysLeft-b.daysLeft)

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{height:32,width:200,borderRadius:10,background:BDARK,animation:'shimmer 1.5s infinite'}}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        {[...Array(3)].map((_,i)=><div key={i} style={{height:100,borderRadius:20,background:BDARK,animation:'shimmer 1.5s infinite'}}/>)}
      </div>
      {[...Array(3)].map((_,i)=><div key={i} style={{height:80,borderRadius:20,background:BDARK,animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:16,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:900,color:G,margin:0}}>لوحة المتابعة</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>مرحباً بك في المراح 🐑</p>
        </div>
        {notifCount > 0 && (
          <Link href="/notifications" style={{display:'flex',alignItems:'center',gap:6,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:'6px 12px',textDecoration:'none',color:'#dc2626',fontSize:13,fontWeight:700}}>
            🔔 {notifCount} تنبيه
          </Link>
        )}
      </div>

      {/* إجمالي + شبك + معزول */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {[
          {l:'الإجمالي', v:flock?.total_sheep||0, icon:'🐑', c:G, bg:GSUBT, href:'/flock'},
          {l:'في الشبك', v:stats.breeding, icon:'🔗', c:GOLDD, bg:GOLDS, href:'/births'},
          {l:'عزل بيطري', v:vet.length, icon:'🩺', c:'#dc2626', bg:'#fef2f2', href:'/vet'},
        ].map(s => (
          <Link key={s.l} href={s.href} style={{...card,textAlign:'center',display:'flex',flexDirection:'column',gap:4,alignItems:'center',background:s.bg,border:`1px solid ${s.c}22`,textDecoration:'none',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:s.c,borderRadius:'20px 20px 0 0'}}/>
            <span style={{fontSize:22,marginTop:4}}>{s.icon}</span>
            <span style={{fontSize:30,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</span>
            <span style={{fontSize:11,color:s.c,opacity:0.8,fontWeight:600}}>{s.l}</span>
          </Link>
        ))}
      </div>

      {/* مراحل المواليد */}
      {(stats.bahm+stats.rakhalWean+stats.rakhalReady+stats.kharafSale) > 0 && (
        <div style={card}>
          <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:1}}>تصنيف المواليد</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[
              {l:'البهم', v:stats.bahm, icon:'🍼', c:'#7c3aed', bg:'#f5f3ff', sub:'0-3 أشهر'},
              {l:'رخال مفطومة', v:stats.rakhalWean, icon:'🔔', c:'#d97706', bg:'#fffbeb', sub:'3-7 أشهر'},
              {l:'رخال جاهزة', v:stats.rakhalReady, icon:'🌿', c:G, bg:GSUBT, sub:'7+ أشهر'},
              {l:'خرفان للبيع', v:stats.kharafSale, icon:'🏷️', c:'#db2777', bg:'#fdf2f8', sub:'3+ أشهر'},
            ].map(s => (
              <div key={s.l} style={{background:s.bg,borderRadius:14,padding:'10px 12px',display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:22}}>{s.icon}</span>
                <div>
                  <div style={{fontSize:22,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
                  <div style={{fontSize:11,color:'#6b7280',marginTop:1}}>{s.l}</div>
                  <div style={{fontSize:10,color:'#9ca3af'}}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* أزرار سريعة */}
      <div>
        <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 10px',textTransform:'uppercase',letterSpacing:1}}>إجراءات سريعة</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            {href:'/births/new', icon:'🐑', label:'تسجيل ولادة', bg:GSUBT, color:G},
            {href:'/vet/isolation/new', icon:'🩺', label:'عزل بيطري', bg:'#eff6ff', color:'#1d4ed8'},
            {href:'/deaths/new', icon:'💀', label:'تسجيل نفوق', bg:'#fef2f2', color:'#dc2626'},
            {href:'/ai', icon:'🤖', label:'مساعد AI', bg:'#faf5ff', color:'#7c3aed'},
          ].map(a => (
            <Link key={a.href} href={a.href} style={{background:a.bg,borderRadius:18,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,textDecoration:'none',border:`1px solid ${a.color}18`,transition:'all .15s'}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${a.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{a.icon}</div>
              <span style={{fontSize:14,fontWeight:700,color:a.color}}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ولادات قريبة */}
      {upcoming.length > 0 && (
        <div>
          <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 10px',textTransform:'uppercase',letterSpacing:1}}>ولادات قريبة ({upcoming.length})</p>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {upcoming.map((b:any) => (
              <Link key={b.id} href={`/births/${b.id}`} style={{...card,display:'flex',alignItems:'center',justifyContent:'space-between',textDecoration:'none',color:'inherit',borderColor:b.daysLeft<=7?'#fca5a5':BDR}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:40,height:40,borderRadius:12,background:b.daysLeft<=7?'#fef2f2':GSUBT,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                    {b.daysLeft<=7?'⚠️':'🤰'}
                  </div>
                  <div>
                    <p style={{margin:0,fontWeight:700,fontSize:14}}>الأم: {b.mom_id}{b.mom_color?` · ${b.mom_color}`:''}</p>
                    <p style={{margin:'2px 0 0',fontSize:11,color:'#6b7280'}}>المتوقع: {b.expectedDate}</p>
                  </div>
                </div>
                <div style={{textAlign:'center',padding:'8px 14px',borderRadius:12,fontWeight:700,fontSize:16,background:b.daysLeft<=7?'#fef2f2':GOLDS,color:b.daysLeft<=7?'#dc2626':GOLDD}}>
                  {b.daysLeft}
                  <div style={{fontSize:10,fontWeight:500,opacity:0.8}}>يوم</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* آخر الولادات + العزل */}
      <div style={{display:'grid',gap:16}} className="sm:grid-cols-2">
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:0,textTransform:'uppercase',letterSpacing:1}}>آخر الولادات</p>
            <Link href="/births" style={{fontSize:12,color:G,fontWeight:600,textDecoration:'none'}}>عرض الكل ←</Link>
          </div>
          {births.length===0 ? (
            <div style={{...card,textAlign:'center',padding:32,color:'#9ca3af'}}>
              <p style={{fontSize:32,margin:'0 0 8px'}}>🐑</p>
              <p style={{margin:0,fontSize:14}}>لا سجلات بعد</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {births.map((b:any) => {
                const alive=(b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length
                return (
                  <Link key={b.id} href={`/births/${b.id}`} style={{...card,display:'flex',alignItems:'center',justifyContent:'space-between',textDecoration:'none',color:'inherit'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:GSUBT,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:G}}>
                        {b.mom_id}
                      </div>
                      <div>
                        <p style={{margin:0,fontWeight:700,fontSize:13}}>{b.mom_color||'—'}</p>
                        <p style={{margin:'1px 0 0',fontSize:11,color:'#9ca3af'}}>{b.birth_date}</p>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{background:GSUBT,color:G,borderRadius:100,padding:'2px 8px',fontSize:11,fontWeight:700}}>{alive} حي</span>
                      {b.in_breeding && <span style={{background:GOLDS,color:GOLDD,borderRadius:100,padding:'2px 8px',fontSize:11}}>🔗</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:0,textTransform:'uppercase',letterSpacing:1}}>العزل البيطري</p>
            <Link href="/vet" style={{fontSize:12,color:G,fontWeight:600,textDecoration:'none'}}>عرض الكل ←</Link>
          </div>
          {vet.length===0 ? (
            <div style={{...card,textAlign:'center',padding:32,color:'#9ca3af'}}>
              <p style={{fontSize:32,margin:'0 0 8px'}}>🩺</p>
              <p style={{margin:0,fontSize:14}}>لا حالات عزل</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {vet.map((v:any) => (
                <Link key={v.id} href={`/vet/isolation/${v.id}`} style={{...card,display:'flex',alignItems:'center',justifyContent:'space-between',textDecoration:'none',color:'inherit',borderColor:'#fecaca'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:36,height:36,borderRadius:10,background:'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🩺</div>
                    <div>
                      <p style={{margin:0,fontWeight:700,fontSize:13}}>{v.animal_id}</p>
                      <p style={{margin:'1px 0 0',fontSize:11,color:'#9ca3af'}}>{v.disease||v.status}</p>
                    </div>
                  </div>
                  <span style={{background:'#fef2f2',color:'#dc2626',borderRadius:100,padding:'2px 8px',fontSize:11,fontWeight:700}}>نشط</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
