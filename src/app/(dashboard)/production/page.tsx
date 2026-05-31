'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const G = '#1e5a10', GOLD = '#c9a84c', GOLDD = '#a8872e', GOLDS = '#fdf8ec'
const GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3'

const COLOR_MAP: Record<string,{bg:string,color:string}> = {
  green:{bg:'#dcfce7',color:'#15803d'},
  red:{bg:'#fef2f2',color:'#dc2626'},
  yellow:{bg:'#fefce8',color:'#ca8a04'},
  orange:{bg:'#fff7ed',color:'#ea580c'},
}

export default function ProductionPage() {
  const [births, setBirths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'count'|'date'>('count')

  useEffect(() => {
    fetch('/api/births').then(r=>r.json()).then(j=>{setBirths(j.data||[]);setLoading(false)})
  }, [])

  // جمع بيانات كل أم
  const momsMap: Record<string, any> = {}
  births.forEach((r:any) => {
    const key = `${r.mom_id}_${r.mom_color}`
    if (!momsMap[key]) {
      momsMap[key] = { mom_id:r.mom_id, mom_color:r.mom_color, records:[], totalBabies:0, aliveBabies:0, lastDate:'' }
    }
    momsMap[key].records.push(r)
    const alive = (r.babies||[]).filter((b:any)=>b.health!=='نفوق').length
    momsMap[key].totalBabies += (r.babies||[]).length
    momsMap[key].aliveBabies += alive
    if (!momsMap[key].lastDate || r.birth_date > momsMap[key].lastDate) {
      momsMap[key].lastDate = r.birth_date
    }
  })

  let moms = Object.values(momsMap)

  if (search) {
    const q = search.toLowerCase()
    moms = moms.filter(m => m.mom_id?.toString().includes(q) || m.mom_color?.includes(q))
  }

  moms.sort((a,b) => sort==='count' ? b.records.length - a.records.length : (b.lastDate > a.lastDate ? 1 : -1))

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:14,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{height:32,width:160,borderRadius:10,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>
      {[...Array(5)].map((_,i)=><div key={i} style={{height:80,borderRadius:20,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>سجل الإنتاج</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>{moms.length} أم منتجة</p>
        </div>
      </div>

      {/* ملخص */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {[
          {l:'الأمهات', v:moms.length, icon:'🐑', c:G, bg:GSUBT},
          {l:'إجمالي الولادات', v:births.length, icon:'📋', c:GOLDD, bg:GOLDS},
          {l:'إجمالي المواليد', v:moms.reduce((s,m)=>s+m.totalBabies,0), icon:'🍼', c:'#6d28d9', bg:'#f5f3ff'},
        ].map(s=>(
          <div key={s.l} style={{background:s.bg,borderRadius:16,padding:'12px 10px',textAlign:'center'}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:24,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:10,color:'#6b7280',marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search + Sort */}
      <div style={{display:'flex',gap:8}}>
        <div style={{flex:1,position:'relative'}}>
          <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'#9ca3af',fontSize:16,pointerEvents:'none'}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث برقم أو لون الأم..."
            style={{width:'100%',background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:12,padding:'10px 36px 10px 12px',fontFamily:'inherit',fontSize:13,outline:'none',boxSizing:'border-box'}}
          />
        </div>
        <select value={sort} onChange={e=>setSort(e.target.value as any)}
          style={{background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:12,padding:'10px 12px',fontFamily:'inherit',fontSize:13,outline:'none',color:'#374151',cursor:'pointer'}}>
          <option value="count">الأكثر إنتاجاً</option>
          <option value="date">الأحدث</option>
        </select>
      </div>

      {/* القائمة */}
      {moms.length === 0 ? (
        <div style={{...card,textAlign:'center',padding:'48px 20px'}}>
          <p style={{fontSize:40,margin:'0 0 12px'}}>📋</p>
          <p style={{fontWeight:700,color:'#374151',margin:0}}>لا سجلات إنتاج</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {moms.map((m:any) => {
            const colorStyle = COLOR_MAP[m.mom_color] || {bg:'#f3f4f6',color:'#6b7280'}
            return (
              <div key={`${m.mom_id}_${m.mom_color}`} style={card}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:44,height:44,borderRadius:12,background:colorStyle.bg,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:15,color:colorStyle.color}}>
                      {m.mom_id}
                    </div>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontSize:15,fontWeight:800}}>{m.mom_id}</span>
                        <span style={{background:colorStyle.bg,color:colorStyle.color,padding:'1px 7px',borderRadius:100,fontSize:11,fontWeight:700}}>{m.mom_color||'—'}</span>
                      </div>
                      <div style={{fontSize:11,color:'#9ca3af',marginTop:1}}>آخر ولادة: {m.lastDate}</div>
                    </div>
                  </div>
                  <div style={{textAlign:'center',background:GSUBT,borderRadius:12,padding:'6px 14px'}}>
                    <div style={{fontSize:22,fontWeight:900,color:G,lineHeight:1}}>{m.records.length}</div>
                    <div style={{fontSize:10,color:G}}>ولادة</div>
                  </div>
                </div>
                {/* سجلات الأم */}
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {m.records.map((r:any,i:number) => {
                    const alive=(r.babies||[]).filter((b:any)=>b.health!=='نفوق').length
                    return (
                      <Link key={r.id} href={`/births/${r.id}`}
                        style={{background:BEIGE,border:`1px solid ${BDR}`,borderRadius:10,padding:'5px 10px',textDecoration:'none',color:'inherit',display:'flex',alignItems:'center',gap:5}}>
                        <span style={{fontSize:11,color:'#9ca3af'}}>#{i+1}</span>
                        <span style={{fontSize:11,fontWeight:600,color:'#374151'}}>{r.birth_date}</span>
                        <span style={{fontSize:11,color:G,fontWeight:700}}>{alive}🍼</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
