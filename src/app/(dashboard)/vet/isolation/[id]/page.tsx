'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'

const G = '#1e5a10', GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'

export default function VetIsolationDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [c, setC] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logForm, setLogForm] = useState({date:new Date().toISOString().split('T')[0],note:'',temp:''})
  const [showLog, setShowLog] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/vet/isolation').then(r=>r.json()).then(j=>{
      setC((j.data||[]).find((x:any)=>x.id===id))
      setLoading(false)
    })
  }, [id])

  async function closeCase() {
    setSaving(true)
    await fetch(`/api/vet/isolation/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({active:false,end_date:new Date().toISOString().split('T')[0]})
    })
    setC((p:any)=>({...p,active:false}))
    setSaving(false)
    toast.success('تم إغلاق الحالة ✅')
  }

  async function addLog() {
    if (!logForm.note.trim()) { toast.error('اكتب ملاحظة'); return }
    setSaving(true)
    const existing = c.extended_log || []
    const newLog = [...existing, {date:logForm.date,note:logForm.note,temp:logForm.temp||null}]
    await fetch(`/api/vet/isolation/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({extended_log:newLog})
    })
    setC((p:any)=>({...p,extended_log:newLog}))
    setLogForm({date:new Date().toISOString().split('T')[0],note:'',temp:''})
    setShowLog(false)
    setSaving(false)
    toast.success('تمت إضافة المتابعة ✅')
  }

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:16,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}
  const inp: React.CSSProperties = {width:'100%',background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:12,padding:'10px 13px',fontFamily:'inherit',fontSize:13,outline:'none',boxSizing:'border-box' as const,color:'#111827'}

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {[...Array(3)].map((_,i)=><div key={i} style={{height:90,borderRadius:20,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )
  if (!c) return (
    <div style={{textAlign:'center',padding:'60px 20px'}}>
      <p style={{fontSize:40,margin:'0 0 12px'}}>🔍</p>
      <p style={{color:'#6b7280',marginBottom:16}}>الحالة غير موجودة</p>
      <button onClick={()=>router.push('/vet')} style={{background:G,color:'white',border:'none',borderRadius:12,padding:'10px 20px',fontFamily:'inherit',fontWeight:700,cursor:'pointer'}}>العودة</button>
    </div>
  )

  const logs = c.extended_log || []
  const days = c.start_date ? Math.floor((Date.now()-new Date(c.start_date).getTime())/(1000*60*60*24)) : 0

  return (
    <div style={{maxWidth:540,margin:'0 auto',display:'flex',flexDirection:'column',gap:14}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={()=>router.push('/vet')} style={{background:BDARK,border:'none',borderRadius:10,width:36,height:36,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div style={{flex:1}}>
          <h1 style={{fontSize:20,fontWeight:900,color:'#1d4ed8',margin:0}}>🩺 {c.animal_id}</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'2px 0 0'}}>{c.disease||c.status}</p>
        </div>
        <span style={{background:c.active?'#fef2f2':'#f0fdf4',color:c.active?'#dc2626':G,padding:'4px 12px',borderRadius:100,fontSize:12,fontWeight:700}}>
          {c.active?'نشط':'تعافى'}
        </span>
      </div>

      {/* بيانات الحالة */}
      <div style={{...card, opacity:c.active?1:0.8}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            {l:'الحيوان', v:c.animal_id},
            {l:'المرض', v:c.disease||c.status||'—'},
            {l:'تاريخ البداية', v:c.start_date},
            {l:'مدة العزل', v:`${days} يوم`},
            {l:'الدواء', v:c.medicine||c.treatment||'—'},
            {l:'الخطورة', v:c.severity||'—'},
          ].map(item=>(
            <div key={item.l} style={{background:BEIGE,borderRadius:12,padding:'10px 12px'}}>
              <p style={{margin:0,fontSize:11,color:'#9ca3af'}}>{item.l}</p>
              <p style={{margin:'3px 0 0',fontWeight:700,fontSize:13}}>{item.v}</p>
            </div>
          ))}
        </div>
        {(c.usage_notes||c.duration_text) && (
          <div style={{background:'#fffbeb',borderRadius:12,padding:'10px 12px',marginTop:10,fontSize:12,color:'#92400e'}}>
            📝 {c.usage_notes||c.duration_text}
          </div>
        )}
      </div>

      {/* المتابعة اليومية */}
      <div style={card}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <h2 style={{margin:0,fontWeight:800,fontSize:14}}>📋 المتابعة اليومية ({logs.length})</h2>
          {c.active && (
            <button onClick={()=>setShowLog(p=>!p)}
              style={{background:showLog?BDARK:'#1d4ed8',color:showLog?'#374151':'white',border:'none',borderRadius:10,padding:'6px 12px',fontFamily:'inherit',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              {showLog?'إلغاء':'+ متابعة'}
            </button>
          )}
        </div>

        {showLog && (
          <div style={{background:BEIGE,borderRadius:16,padding:14,marginBottom:14,display:'flex',flexDirection:'column',gap:10}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:'#6b7280',marginBottom:5}}>التاريخ</label>
                <input type="date" style={inp} value={logForm.date} onChange={e=>setLogForm(p=>({...p,date:e.target.value}))} />
              </div>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:'#6b7280',marginBottom:5}}>الحرارة (°م)</label>
                <input type="number" step="0.1" style={inp} placeholder="38.5" value={logForm.temp} onChange={e=>setLogForm(p=>({...p,temp:e.target.value}))} />
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:'#6b7280',marginBottom:5}}>الملاحظة *</label>
              <textarea style={{...inp,resize:'none' as const,height:72}} rows={2} placeholder="الحالة اليوم، العلاج المعطى..." value={logForm.note} onChange={e=>setLogForm(p=>({...p,note:e.target.value}))} />
            </div>
            <button onClick={addLog} disabled={saving}
              style={{background:G,color:'white',border:'none',borderRadius:12,padding:'11px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',opacity:saving?0.7:1}}>
              {saving?'⏳...':'💾 حفظ المتابعة'}
            </button>
          </div>
        )}

        {logs.length===0 ? (
          <div style={{textAlign:'center',padding:'24px',color:'#9ca3af'}}>
            <p style={{fontSize:28,margin:'0 0 8px'}}>📋</p>
            <p style={{fontSize:13,margin:0}}>لا توجد متابعات بعد</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[...logs].reverse().map((log:any,i:number)=>(
              <div key={i} style={{display:'flex',gap:10,padding:'10px 12px',background:BEIGE,borderRadius:12}}>
                <p style={{fontSize:11,color:'#9ca3af',flexShrink:0,margin:0,paddingTop:1}}>{log.date}</p>
                <div style={{flex:1}}>
                  <p style={{margin:0,fontSize:13,color:'#111827'}}>{log.note}</p>
                  {log.temp && <p style={{margin:'3px 0 0',fontSize:11,color:'#6b7280'}}>🌡️ {log.temp}°م</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* إغلاق الحالة */}
      {c.active && (
        <div style={card}>
          <button onClick={closeCase} disabled={saving}
            style={{width:'100%',background:'#f0fdf4',border:`1px solid ${G}33`,borderRadius:14,padding:'13px',fontFamily:'inherit',fontSize:14,fontWeight:700,color:G,cursor:'pointer',opacity:saving?0.7:1}}>
            ✅ إغلاق الحالة (تعافى)
          </button>
        </div>
      )}
    </div>
  )
}
