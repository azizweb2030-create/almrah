'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const G = '#1e5a10', BEIGE = '#f8f4ee', BDR = '#d8cfc3'

export default function VetPage() {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active'|'all'>('active')

  useEffect(() => {
    fetch('/api/vet/isolation').then(r=>r.json()).then(j=>{setCases(j.data||[]);setLoading(false)})
  }, [])

  const active = cases.filter(c=>c.active)
  const all = cases
  const list = tab==='active' ? active : all

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:14,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{height:32,width:160,borderRadius:10,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>
      {[...Array(3)].map((_,i)=><div key={i} style={{height:90,borderRadius:20,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>البيطرة</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>{active.length} حالة نشطة</p>
        </div>
        <Link href="/vet/isolation/new" style={{display:'flex',alignItems:'center',gap:6,background:'#1d4ed8',color:'white',borderRadius:14,padding:'10px 16px',textDecoration:'none',fontSize:14,fontWeight:700,boxShadow:'0 4px 14px rgba(29,78,216,0.3)'}}>
          ＋ عزل
        </Link>
      </div>

      {/* ملخص */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={{...card,background:'#eff6ff',border:'1px solid #bfdbfe',textAlign:'center'}}>
          <div style={{fontSize:28,fontWeight:900,color:'#1d4ed8'}}>{active.length}</div>
          <div style={{fontSize:12,color:'#3b82f6',fontWeight:600}}>نشط</div>
        </div>
        <div style={{...card,background:'#f0fdf4',border:'1px solid #bbf7d0',textAlign:'center'}}>
          <div style={{fontSize:28,fontWeight:900,color:G}}>{cases.filter(c=>!c.active).length}</div>
          <div style={{fontSize:12,color:G,fontWeight:600}}>تعافى</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:8,background:'#ede7db',padding:4,borderRadius:16}}>
        {[{k:'active',l:`نشط (${active.length})`},{k:'all',l:`الكل (${all.length})`}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k as any)}
            style={{flex:1,padding:'8px',borderRadius:12,border:'none',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',
              background:tab===t.k?'white':'transparent',color:tab===t.k?G:'#6b7280',
              boxShadow:tab===t.k?'0 1px 4px rgba(0,0,0,0.08)':'none'}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* القائمة */}
      {list.length===0 ? (
        <div style={{...card,textAlign:'center',padding:'48px 20px'}}>
          <p style={{fontSize:40,margin:'0 0 12px'}}>🩺</p>
          <p style={{fontWeight:700,color:'#374151',margin:'0 0 4px'}}>لا حالات</p>
          <p style={{fontSize:13,color:'#9ca3af',margin:0}}>اضغط + لإضافة حالة عزل</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {list.map((c:any) => {
            const days = c.start_date ? Math.floor((Date.now()-new Date(c.start_date).getTime())/(1000*60*60*24)) : 0
            const isCritical = days >= (c.duration_days||7)
            return (
              <Link key={c.id} href={`/vet/isolation/${c.id}`} style={{
                ...card, display:'flex', alignItems:'center', gap:12, textDecoration:'none', color:'inherit',
                borderColor: isCritical&&c.active ? '#fca5a5' : BDR,
                background: isCritical&&c.active ? '#fffafa' : 'white'
              }}>
                <div style={{width:44,height:44,borderRadius:12,background:c.active?'#eff6ff':'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                  {c.active?'🩺':'✅'}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontSize:15,fontWeight:800}}>{c.animal_id}</span>
                    <span style={{
                      background:c.active?(isCritical?'#fef2f2':'#eff6ff'):'#f0fdf4',
                      color:c.active?(isCritical?'#dc2626':'#1d4ed8'):G,
                      padding:'1px 8px',borderRadius:100,fontSize:11,fontWeight:700
                    }}>{c.active?(isCritical?'حرج':'نشط'):'تعافى'}</span>
                  </div>
                  <div style={{fontSize:11,color:'#9ca3af',display:'flex',gap:10}}>
                    <span>🦠 {c.disease||c.status}</span>
                    {c.active && <span>⏱ {days} يوم</span>}
                  </div>
                </div>
                <span style={{color:'#d1d5db',fontSize:18}}>←</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
