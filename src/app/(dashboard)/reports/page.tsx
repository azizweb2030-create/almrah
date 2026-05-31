'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const G = '#1e5a10', GOLD = '#c9a84c', GOLDD = '#a8872e', GOLDS = '#fdf8ec'
const GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3'

export default function ReportsPage() {
  const [flock, setFlock] = useState<any>(null)
  const [births, setBirths] = useState<any[]>([])
  const [deaths, setDeaths] = useState<any[]>([])
  const [vet, setVet] = useState<any[]>([])
  const [rams, setRams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r=>r.json()),
      fetch('/api/births').then(r=>r.json()),
      fetch('/api/deaths').then(r=>r.json()),
      fetch('/api/vet/isolation').then(r=>r.json()),
      fetch('/api/rams').then(r=>r.json()),
    ]).then(([f,b,d,v,r]) => {
      setFlock(f.data); setBirths(b.data||[]); setDeaths(d.data||[])
      setVet(v.data||[]); setRams(r.data||[])
      setLoading(false)
    })
  }, [])

  const now = new Date()
  let bahm=0, rakhalWean=0, rakhalReady=0, kharafSale=0, totalBabies=0, deadBabies=0

  births.forEach((r:any) => {
    const bd = r.original_birth_date || r.birth_date
    const months = bd ? (now.getTime()-new Date(bd).getTime())/(1000*60*60*24*30.44) : 0
    ;(r.babies||[]).forEach((b:any) => {
      totalBabies++
      if (b.health==='نفوق') { deadBabies++; return }
      if (!b.stage && months<3) bahm++
      if (b.gender==='رخل') {
        if (b.stage==='مفطوم'||(!b.stage&&months>=3&&months<7)) rakhalWean++
        if (b.stage==='جاهز للإنتاج'||(!b.stage&&months>=7)) rakhalReady++
      } else {
        if (b.stage==='جاهز للبيع'||(!b.stage&&months>=3)) kharafSale++
      }
    })
  })

  const activeVet = vet.filter(v=>v.active).length
  const activeRams = rams.filter(r=>!r.dead).length
  const deathsByCategory: Record<string,number> = {}
  deaths.forEach(d => { deathsByCategory[d.category]=(deathsByCategory[d.category]||0)+1 })

  async function exportPDF() {
    setPrinting(true)
    try {
      const res = await fetch('/api/reports/pdf', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ flock, births, deaths, vet, rams, stats:{bahm,rakhalWean,rakhalReady,kharafSale,totalBabies,deadBabies,activeVet,activeRams} })
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `المراح-تقرير-${now.toISOString().split('T')[0]}.pdf`
      a.click(); URL.revokeObjectURL(url)
      toast.success('تم تصدير التقرير ✅')
    } catch {
      // fallback: print
      window.print()
    } finally { setPrinting(false) }
  }

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:16,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {[...Array(5)].map((_,i)=><div key={i} style={{height:90,borderRadius:20,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>التقارير</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>{now.toLocaleDateString('ar-SA')}</p>
        </div>
        <button onClick={exportPDF} disabled={printing}
          style={{display:'flex',alignItems:'center',gap:6,background:G,color:'white',borderRadius:14,padding:'10px 16px',border:'none',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:`0 4px 14px ${G}44`,opacity:printing?0.7:1}}>
          {printing ? '⏳ جاري...' : '📥 تصدير PDF'}
        </button>
      </div>

      {/* ملخص القطيع */}
      <div style={card}>
        <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:1}}>ملخص القطيع</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
          {[
            {l:'الإجمالي', v:flock?.total_sheep||0, c:G, bg:GSUBT, icon:'🐑'},
            {l:'الأمهات المنتجات', v:new Set(births.map((r:any)=>r.mom_id+'_'+r.mom_color)).size, c:G, bg:GSUBT, icon:'🐑'},
            {l:'في الشبك', v:births.filter((r:any)=>r.in_breeding).length, c:GOLDD, bg:GOLDS, icon:'🔗'},
            {l:'الفحول النشطة', v:activeRams, c:'#6d28d9', bg:'#f5f3ff', icon:'🐏'},
            {l:'العزل النشط', v:activeVet, c:'#dc2626', bg:'#fef2f2', icon:'🩺'},
            {l:'إجمالي الولادات', v:births.length, c:G, bg:GSUBT, icon:'📋'},
          ].map(s=>(
            <div key={s.l} style={{background:s.bg,borderRadius:14,padding:'10px 8px',textAlign:'center'}}>
              <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:22,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:10,color:'#6b7280',marginTop:3,lineHeight:1.3}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* مراحل المواليد */}
      <div style={card}>
        <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:1}}>تصنيف المواليد</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[
            {l:'البهم (0-3 أشهر)', v:bahm, icon:'🍼', c:'#7c3aed', bg:'#f5f3ff'},
            {l:'رخال مفطومة', v:rakhalWean, icon:'🔔', c:'#d97706', bg:'#fffbeb'},
            {l:'رخال جاهزة للإنتاج', v:rakhalReady, icon:'🌿', c:G, bg:GSUBT},
            {l:'خرفان للبيع', v:kharafSale, icon:'🏷️', c:'#db2777', bg:'#fdf2f8'},
            {l:'إجمالي المواليد', v:totalBabies, icon:'🍼', c:'#374151', bg:'#f9fafb'},
            {l:'نفوق المواليد', v:deadBabies, icon:'💀', c:'#dc2626', bg:'#fef2f2'},
          ].map(s=>(
            <div key={s.l} style={{background:s.bg,borderRadius:14,padding:'10px 12px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>{s.icon}</span>
              <div>
                <div style={{fontSize:20,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:11,color:'#6b7280',marginTop:1}}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* النفوق */}
      {deaths.length > 0 && (
        <div style={card}>
          <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:1}}>سجل النفوق ({deaths.length})</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {Object.entries(deathsByCategory).map(([cat,cnt])=>(
              <div key={cat} style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:'6px 14px',display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:18}}>💀</span>
                <div>
                  <span style={{fontSize:16,fontWeight:900,color:'#dc2626'}}>{cnt}</span>
                  <span style={{fontSize:12,color:'#6b7280',marginRight:4}}>{cat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الفحول */}
      <div style={card}>
        <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:1}}>الفحول ({rams.length})</p>
        <div style={{display:'flex',gap:3}}>
          <div style={{flex:1,background:GSUBT,borderRadius:12,padding:'10px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:900,color:G}}>{activeRams}</div>
            <div style={{fontSize:11,color:G}}>نشط</div>
          </div>
          <div style={{flex:1,background:'#fef2f2',borderRadius:12,padding:'10px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:900,color:'#dc2626'}}>{rams.filter(r=>r.dead).length}</div>
            <div style={{fontSize:11,color:'#dc2626'}}>نافق</div>
          </div>
        </div>
      </div>

    </div>
  )
}
