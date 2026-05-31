'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'

const G = '#1e5a10', GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (q.length < 1) { setResults(null); return }
    setLoading(true)
    try {
      const [births, deaths, vet] = await Promise.all([
        fetch('/api/births').then(r=>r.json()),
        fetch('/api/deaths').then(r=>r.json()),
        fetch('/api/vet/isolation').then(r=>r.json()),
      ])
      const qStr = q.toLowerCase()
      const matchedBirths = (births.data||[]).filter((b:any) =>
        b.mom_id?.toString().includes(qStr) || b.mom_color?.includes(qStr) ||
        (b.babies||[]).some((bb:any) => bb.id?.toString().includes(qStr))
      )
      const matchedDeaths = (deaths.data||[]).filter((d:any) =>
        d.animal_id?.toString().includes(qStr) || d.category?.includes(qStr)
      )
      const matchedVet = (vet.data||[]).filter((v:any) =>
        v.animal_id?.toString().includes(qStr) || v.disease?.includes(qStr)
      )
      setResults({ births:matchedBirths, deaths:matchedDeaths, vet:matchedVet })
    } finally { setLoading(false) }
  }, [])

  const handleChange = (v: string) => { setQuery(v); search(v) }

  const total = results ? results.births.length + results.deaths.length + results.vet.length : 0
  const card: React.CSSProperties = {background:'white',borderRadius:18,border:`1px solid ${BDR}`,padding:14,boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>

      <div>
        <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>البحث الموحد</h1>
        <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>ابحث في كل سجلات المراح</p>
      </div>

      {/* Search Input */}
      <div style={{position:'relative'}}>
        <span style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',fontSize:20,pointerEvents:'none'}}>🔍</span>
        <input
          autoFocus value={query} onChange={e=>handleChange(e.target.value)}
          placeholder="ابحث برقم الحيوان..."
          inputMode="numeric"
          style={{width:'100%',background:'white',border:`2px solid ${G}`,borderRadius:16,padding:'14px 44px 14px 14px',fontFamily:'inherit',fontSize:16,fontWeight:600,outline:'none',boxSizing:'border-box',boxShadow:`0 0 0 4px ${G}18`}}
        />
        {loading && <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'#9ca3af'}}>⏳</span>}
      </div>

      {/* النتائج */}
      {results && (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {total === 0 ? (
            <div style={{...card,textAlign:'center',padding:'40px 20px'}}>
              <p style={{fontSize:36,margin:'0 0 10px'}}>🔍</p>
              <p style={{fontWeight:700,color:'#374151',margin:'0 0 4px'}}>لا نتائج</p>
              <p style={{fontSize:12,color:'#9ca3af',margin:0}}>جرّب رقماً مختلفاً</p>
            </div>
          ) : (
            <>
              <p style={{fontSize:12,fontWeight:700,color:'#9ca3af',margin:0}}>{total} نتيجة</p>

              {/* الولادات */}
              {results.births.length > 0 && (
                <div>
                  <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 8px',textTransform:'uppercase',letterSpacing:1}}>🐑 الولادات ({results.births.length})</p>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {results.births.map((b:any) => {
                      const alive=(b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length
                      return (
                        <Link key={b.id} href={`/births/${b.id}`} style={{...card,display:'flex',alignItems:'center',gap:12,textDecoration:'none',color:'inherit'}}>
                          <div style={{width:40,height:40,borderRadius:11,background:GSUBT,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:14,color:G}}>{b.mom_id}</div>
                          <div style={{flex:1}}>
                            <p style={{margin:0,fontWeight:700,fontSize:14}}>أم: {b.mom_id} {b.mom_color&&`· ${b.mom_color}`}</p>
                            <p style={{margin:'2px 0 0',fontSize:11,color:'#9ca3af'}}>📅 {b.birth_date} · 🍼 {alive} حي</p>
                          </div>
                          <span style={{color:'#d1d5db',fontSize:16}}>←</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* النفوق */}
              {results.deaths.length > 0 && (
                <div>
                  <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 8px',textTransform:'uppercase',letterSpacing:1}}>💀 النفوق ({results.deaths.length})</p>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {results.deaths.map((d:any) => (
                      <div key={d.id} style={{...card,display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:40,height:40,borderRadius:11,background:'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>💀</div>
                        <div>
                          <p style={{margin:0,fontWeight:700,fontSize:14}}>رقم: {d.animal_id||'—'}</p>
                          <p style={{margin:'2px 0 0',fontSize:11,color:'#9ca3af'}}>{d.category} · {d.date||d.created_at?.split('T')[0]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* البيطرة */}
              {results.vet.length > 0 && (
                <div>
                  <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 8px',textTransform:'uppercase',letterSpacing:1}}>🩺 البيطرة ({results.vet.length})</p>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {results.vet.map((v:any) => (
                      <Link key={v.id} href={`/vet/isolation/${v.id}`} style={{...card,display:'flex',alignItems:'center',gap:12,textDecoration:'none',color:'inherit'}}>
                        <div style={{width:40,height:40,borderRadius:11,background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🩺</div>
                        <div style={{flex:1}}>
                          <p style={{margin:0,fontWeight:700,fontSize:14}}>{v.animal_id}</p>
                          <p style={{margin:'2px 0 0',fontSize:11,color:'#9ca3af'}}>{v.disease||v.status} · {v.active?'نشط':'تعافى'}</p>
                        </div>
                        <span style={{background:v.active?'#fef2f2':'#f0fdf4',color:v.active?'#dc2626':G,padding:'2px 8px',borderRadius:100,fontSize:11,fontWeight:700}}>{v.active?'نشط':'تعافى'}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* حالة البداية */}
      {!results && !loading && (
        <div style={{textAlign:'center',padding:'48px 20px',color:'#9ca3af'}}>
          <p style={{fontSize:48,margin:'0 0 12px'}}>🔍</p>
          <p style={{fontSize:14,fontWeight:600,margin:'0 0 6px'}}>ابحث في سجلات المراح</p>
          <p style={{fontSize:12,margin:0}}>أدخل رقم الحيوان للبحث في الولادات والنفوق والبيطرة</p>
        </div>
      )}
    </div>
  )
}
