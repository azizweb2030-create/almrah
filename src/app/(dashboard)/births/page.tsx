'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const G = '#1e5a10', GOLD = '#c9a84c', GOLDD = '#a8872e', GOLDS = '#fdf8ec'
const GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3'

const COLOR_MAP: Record<string,{bg:string,color:string}> = {
  green: {bg:'#dcfce7',color:'#15803d'},
  red:   {bg:'#fef2f2',color:'#dc2626'},
  yellow:{bg:'#fefce8',color:'#ca8a04'},
  orange:{bg:'#fff7ed',color:'#ea580c'},
}

export default function BirthsPage() {
  const [births, setBirths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all'|'breeding'|'home'>('all')

  useEffect(() => {
    fetch('/api/births').then(r=>r.json()).then(j=>{setBirths(j.data||[]);setLoading(false)})
  }, [])

  const filtered = births.filter(b => {
    const q = search.toLowerCase()
    const matchQ = !q || b.mom_id?.toString().includes(q) || b.mom_color?.includes(q)
    const matchF = filter==='all' || (filter==='breeding'&&b.in_breeding) || (filter==='home'&&!b.in_breeding)
    return matchQ && matchF
  })

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:14,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{height:32,width:180,borderRadius:10,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>
      <div style={{height:44,borderRadius:14,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>
      {[...Array(5)].map((_,i)=><div key={i} style={{height:80,borderRadius:20,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>سجل الولادات</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>{births.length} سجل مسجّل</p>
        </div>
        <Link href="/births/new" style={{display:'flex',alignItems:'center',gap:6,background:G,color:'white',borderRadius:14,padding:'10px 16px',textDecoration:'none',fontSize:14,fontWeight:700,boxShadow:`0 4px 14px ${G}44`}}>
          ＋ ولادة
        </Link>
      </div>

      {/* Search */}
      <div style={{position:'relative'}}>
        <span style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',fontSize:16,color:'#9ca3af',pointerEvents:'none'}}>🔍</span>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="ابحث برقم أو لون الأم..."
          style={{width:'100%',background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:14,padding:'11px 42px 11px 14px',fontFamily:'inherit',fontSize:14,outline:'none',boxSizing:'border-box'}}
        />
      </div>

      {/* فلاتر */}
      <div style={{display:'flex',gap:8,background:'#ede7db',padding:4,borderRadius:16}}>
        {[{k:'all',l:'الكل'},{k:'breeding',l:'🔗 في الشبك'},{k:'home',l:'🏠 في المراح'}].map(f=>(
          <button key={f.k} onClick={()=>setFilter(f.k as any)}
            style={{flex:1,padding:'8px 4px',borderRadius:12,border:'none',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .15s',
              background:filter===f.k?'white':'transparent',
              color:filter===f.k?G:'#6b7280',
              boxShadow:filter===f.k?'0 1px 4px rgba(0,0,0,0.08)':'none'
            }}>{f.l}</button>
        ))}
      </div>

      {/* القائمة */}
      {filtered.length===0 ? (
        <div style={{...card,textAlign:'center',padding:'48px 20px'}}>
          <p style={{fontSize:40,margin:'0 0 12px'}}>🐑</p>
          <p style={{fontWeight:700,color:'#374151',margin:'0 0 6px'}}>لا توجد سجلات</p>
          <p style={{fontSize:13,color:'#9ca3af',margin:0}}>جرّب تغيير الفلتر أو البحث</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map((b:any) => {
            const alive = (b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length
            const dead = (b.babies||[]).filter((bb:any)=>bb.health==='نفوق').length
            const colorStyle = COLOR_MAP[b.mom_color] || {bg:'#f3f4f6',color:'#6b7280'}
            return (
              <Link key={b.id} href={`/births/${b.id}`} style={{...card,display:'flex',alignItems:'center',gap:12,textDecoration:'none',color:'inherit'}}>
                {/* أفاتار */}
                <div style={{width:48,height:48,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:16,flexShrink:0,background:colorStyle.bg,color:colorStyle.color}}>
                  {b.mom_id}
                </div>
                {/* معلومات */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <span style={{fontSize:15,fontWeight:800}}>{b.mom_id}</span>
                    <span style={{background:colorStyle.bg,color:colorStyle.color,padding:'1px 7px',borderRadius:100,fontSize:11,fontWeight:700}}>{b.mom_color||'—'}</span>
                    {b.in_breeding && <span style={{background:GOLDS,color:GOLDD,padding:'1px 7px',borderRadius:100,fontSize:11,fontWeight:700}}>🔗 شبك</span>}
                  </div>
                  <div style={{fontSize:11,color:'#9ca3af',display:'flex',gap:10}}>
                    <span>📅 {b.birth_date}</span>
                    <span>🍼 {alive} حي{dead>0?` · ${dead} نفوق`:''}</span>
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
