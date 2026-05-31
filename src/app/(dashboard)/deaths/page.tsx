'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const G = '#1e5a10', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'

const CATEGORY_ICONS: Record<string,string> = {
  'نعجة':'🐑','رخل':'🐏','بهم':'🍼','خروف':'🐑','مفطوم':'🔔'
}

export default function DeathsPage() {
  const [deaths, setDeaths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/deaths').then(r=>r.json()).then(j=>{setDeaths(j.data||[]);setLoading(false)})
  }, [])

  const byCategory: Record<string,number> = {}
  deaths.forEach(d => { byCategory[d.category]=(byCategory[d.category]||0)+1 })

  const filtered = deaths.filter(d => {
    const q = search.toLowerCase()
    return !q || d.animal_id?.toString().includes(q) || d.category?.includes(q) || d.cause?.includes(q)
  })

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:14,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{height:32,width:160,borderRadius:10,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>
      {[...Array(4)].map((_,i)=><div key={i} style={{height:76,borderRadius:20,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>سجل النفوق</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>{deaths.length} حالة مسجّلة</p>
        </div>
        <Link href="/deaths/new" style={{display:'flex',alignItems:'center',gap:6,background:'#dc2626',color:'white',borderRadius:14,padding:'10px 16px',textDecoration:'none',fontSize:14,fontWeight:700,boxShadow:'0 4px 14px rgba(220,38,38,0.3)'}}>
          ＋ تسجيل
        </Link>
      </div>

      {/* ملخص التصنيفات */}
      {Object.keys(byCategory).length > 0 && (
        <div style={{...card,background:'#fef2f2',border:'1px solid #fecaca'}}>
          <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 10px',textTransform:'uppercase',letterSpacing:1}}>توزيع النفوق</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {Object.entries(byCategory).map(([cat,cnt])=>(
              <div key={cat} style={{background:'white',border:'1px solid #fecaca',borderRadius:12,padding:'6px 12px',display:'flex',alignItems:'center',gap:6}}>
                <span>{CATEGORY_ICONS[cat]||'💀'}</span>
                <span style={{fontSize:13,fontWeight:700,color:'#dc2626'}}>{cnt}</span>
                <span style={{fontSize:12,color:'#6b7280'}}>{cat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{position:'relative'}}>
        <span style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',fontSize:16,color:'#9ca3af',pointerEvents:'none'}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث برقم الحيوان أو السبب..."
          style={{width:'100%',background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:14,padding:'11px 42px 11px 14px',fontFamily:'inherit',fontSize:14,outline:'none',boxSizing:'border-box'}}
        />
      </div>

      {/* القائمة */}
      {filtered.length===0 ? (
        <div style={{...card,textAlign:'center',padding:'48px 20px'}}>
          <p style={{fontSize:40,margin:'0 0 12px'}}>📋</p>
          <p style={{fontWeight:700,color:'#374151',margin:0}}>{deaths.length===0?'لا سجلات نفوق':'لا نتائج'}</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map((d:any) => (
            <div key={d.id} style={{...card,display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                {CATEGORY_ICONS[d.category]||'💀'}
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                  <span style={{fontSize:15,fontWeight:800}}>رقم: {d.animal_id||'—'}</span>
                  <span style={{background:'#fef2f2',color:'#dc2626',padding:'1px 8px',borderRadius:100,fontSize:11,fontWeight:700}}>{d.category}</span>
                </div>
                <div style={{fontSize:11,color:'#9ca3af',display:'flex',gap:10}}>
                  <span>📅 {d.date||d.created_at?.split('T')[0]}</span>
                  {d.cause && <span>🔍 {d.cause}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
