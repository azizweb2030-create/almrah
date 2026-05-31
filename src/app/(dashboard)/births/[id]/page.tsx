'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'

const G = '#1e5a10', GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'
const GOLD = '#c9a84c', GOLDD = '#a8872e', GOLDS = '#fdf8ec'

export default function BirthDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [birth, setBirth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/births/${id}`).then(r=>r.json()).then(j=>{setBirth(j.data);setLoading(false)})
  }, [id])

  async function toggleBreeding() {
    const newVal = !birth.in_breeding
    if (newVal && birth.birth_date) {
      const daysSince = Math.round((Date.now()-new Date(birth.birth_date).getTime())/(1000*60*60*24))
      if (daysSince < 15) { toast.error(`يمكن تفعيل الشبك بعد ${15-daysSince} يوم`); return }
    }
    setSaving(true)
    const breedingDate = newVal ? new Date().toISOString().split('T')[0] : null
    const res = await fetch(`/api/births/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({in_breeding:newVal,breeding_date:breedingDate,hidden_from_home:newVal})
    })
    const j = await res.json()
    if (j.error) { toast.error(j.error) }
    else { setBirth((p:any)=>({...p,in_breeding:newVal,breeding_date:breedingDate})); toast.success(newVal?'🔗 تم تفعيل الشبك':'تم إلغاء الشبك') }
    setSaving(false)
  }

  async function handleDelete() {
    await fetch(`/api/births/${id}`,{method:'DELETE'})
    toast.success('تم الحذف')
    router.push('/births')
  }

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:16,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {[...Array(3)].map((_,i)=><div key={i} style={{height:90,borderRadius:20,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )
  if (!birth) return (
    <div style={{textAlign:'center',padding:'60px 20px'}}>
      <p style={{fontSize:40,margin:'0 0 12px'}}>🔍</p>
      <p style={{color:'#6b7280',marginBottom:16}}>السجل غير موجود</p>
      <button onClick={()=>router.push('/births')} style={{background:G,color:'white',border:'none',borderRadius:12,padding:'10px 20px',fontFamily:'inherit',fontWeight:700,cursor:'pointer'}}>العودة</button>
    </div>
  )

  const alive = (birth.babies||[]).filter((b:any)=>b.health!=='نفوق').length
  const sick  = (birth.babies||[]).filter((b:any)=>b.health==='مريض').length
  const dead  = (birth.babies||[]).filter((b:any)=>b.health==='نفوق').length
  const daysSince = birth.birth_date ? Math.round((Date.now()-new Date(birth.birth_date).getTime())/(1000*60*60*24)) : null
  const canBreed = daysSince !== null && daysSince >= 15 && !birth.in_breeding

  const expectedBirth = birth.in_breeding && birth.breeding_date
    ? (() => { const d=new Date(birth.breeding_date); d.setDate(d.getDate()+150); return d.toISOString().split('T')[0] })()
    : null
  const daysLeft = expectedBirth ? Math.ceil((new Date(expectedBirth).getTime()-Date.now())/(1000*60*60*24)) : null
  const progress = daysLeft!==null ? Math.min(100,Math.max(0,((150-daysLeft)/150)*100)) : 0

  return (
    <div style={{maxWidth:540,margin:'0 auto',display:'flex',flexDirection:'column',gap:14}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={()=>router.push('/births')} style={{background:BDARK,border:'none',borderRadius:10,width:36,height:36,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div style={{flex:1}}>
          <h1 style={{fontSize:20,fontWeight:900,color:G,margin:0}}>الأم {birth.mom_id}</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'2px 0 0'}}>{birth.birth_date}</p>
        </div>
        {birth.in_breeding && <span style={{background:GOLDS,color:GOLDD,padding:'4px 12px',borderRadius:100,fontSize:12,fontWeight:700}}>🔗 شبك</span>}
      </div>

      {/* بيانات الأم */}
      <div style={card}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            {l:'رقم الأم', v:birth.mom_id},
            {l:'اللون', v:birth.mom_color||'—'},
            {l:'تاريخ الولادة', v:birth.birth_date},
            {l:'المواليد', v:`${alive} حي · ${sick>0?`${sick} مريض · `:''}${dead>0?`${dead} نفوق`:''}`.replace(/ · $/,'')},
          ].map(item=>(
            <div key={item.l} style={{background:BEIGE,borderRadius:12,padding:'10px 12px'}}>
              <p style={{margin:0,fontSize:11,color:'#9ca3af'}}>{item.l}</p>
              <p style={{margin:'3px 0 0',fontWeight:700,fontSize:14}}>{item.v}</p>
            </div>
          ))}
        </div>
        {birth.meds && birth.meds.length>0 && (
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>
            <span style={{fontSize:11,color:'#9ca3af'}}>الأدوية:</span>
            {birth.meds.map((m:string,i:number)=>(
              <span key={i} style={{background:'#f3f4f6',color:'#6b7280',padding:'2px 8px',borderRadius:100,fontSize:11,fontWeight:600}}>{m}</span>
            ))}
          </div>
        )}
        {daysSince!==null && <p style={{fontSize:11,color:'#9ca3af',margin:'8px 0 0'}}>منذ {daysSince} يوم</p>}
      </div>

      {/* شبك التلقيح */}
      <div style={{...card,borderColor:birth.in_breeding?`${GOLD}55`:BDR,background:birth.in_breeding?GOLDS:'white'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:birth.in_breeding?12:0}}>
          <div>
            <h2 style={{margin:0,fontWeight:800,fontSize:14,color:birth.in_breeding?GOLDD:'#374151'}}>🔗 شبك التلقيح</h2>
            {birth.breeding_date && <p style={{margin:'3px 0 0',fontSize:11,color:'#9ca3af'}}>بدأ: {birth.breeding_date}</p>}
          </div>
          <button onClick={toggleBreeding} disabled={saving||(!birth.in_breeding&&!canBreed)}
            style={{padding:'8px 14px',borderRadius:12,border:'none',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:saving||(!birth.in_breeding&&!canBreed)?'not-allowed':'pointer',opacity:saving?0.7:1,
              background:birth.in_breeding?'#fef2f2':canBreed?G:'#f3f4f6',
              color:birth.in_breeding?'#dc2626':canBreed?'white':'#9ca3af'
            }}>
            {saving?'⏳':birth.in_breeding?'إلغاء الشبك':canBreed?'🔗 تفعيل':'⏳ '+(15-(daysSince||0))+' يوم'}
          </button>
        </div>
        {birth.in_breeding && expectedBirth && daysLeft!==null && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:8}}>
              <span style={{color:'#6b7280'}}>الولادة المتوقعة: {expectedBirth}</span>
              <span style={{fontWeight:700,color:daysLeft<0?'#dc2626':daysLeft<=14?GOLDD:G}}>
                {daysLeft<0?`متأخرة ${Math.abs(daysLeft)} يوم`:`${daysLeft} يوم متبقٍ`}
              </span>
            </div>
            <div style={{height:10,background:'#e5e7eb',borderRadius:100,overflow:'hidden'}}>
              <div style={{height:'100%',background:GOLD,borderRadius:100,width:`${progress}%`,transition:'width .3s'}}/>
            </div>
          </div>
        )}
        {!birth.in_breeding && !canBreed && daysSince!==null && daysSince<15 && (
          <p style={{fontSize:11,color:'#9ca3af',marginTop:8}}>يمكن تفعيل الشبك بعد {15-daysSince} يوم</p>
        )}
      </div>

      {/* المواليد */}
      {(birth.babies||[]).length>0 && (
        <div style={card}>
          <h2 style={{fontWeight:800,fontSize:14,margin:'0 0 12px'}}>🍼 المواليد ({(birth.babies||[]).length})</h2>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {(birth.babies||[]).map((baby:any,i:number)=>{
              const isRakhl = baby.gender==='رخل'
              const isDead = baby.health==='نفوق'
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:14,background:isDead?'#f3f4f6':BEIGE,opacity:isDead?0.6:1}}>
                  <div style={{width:38,height:38,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,background:isRakhl?'#fce7f3':'#eff6ff',fontWeight:900}}>
                    {isDead?'💀':isRakhl?'🐑':'🐏'}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                      <span style={{fontWeight:800,fontSize:14}}>{baby.baby_id}</span>
                      {baby.stage && (
                        <span style={{background:baby.stage==='جاهز للإنتاج'?GSUBT:baby.stage==='مفطوم'?GOLDS:'#f3f4f6',color:baby.stage==='جاهز للإنتاج'?G:baby.stage==='مفطوم'?GOLDD:'#6b7280',padding:'1px 7px',borderRadius:100,fontSize:10,fontWeight:700}}>
                          {baby.stage}
                        </span>
                      )}
                    </div>
                    <p style={{margin:0,fontSize:11,color:'#9ca3af'}}>{baby.gender} · {baby.color||'—'} · {baby.health}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* حذف */}
      <div style={card}>
        {!confirm ? (
          <button onClick={()=>setConfirm(true)}
            style={{width:'100%',background:'none',border:'none',color:'#dc2626',fontFamily:'inherit',fontSize:13,fontWeight:600,cursor:'pointer',padding:'8px'}}>
            🗑 حذف هذا السجل
          </button>
        ) : (
          <div>
            <p style={{textAlign:'center',fontSize:13,color:'#dc2626',fontWeight:700,margin:'0 0 12px'}}>هل أنت متأكد من الحذف؟</p>
            <div style={{display:'flex',gap:8}}>
              <button onClick={handleDelete} style={{flex:1,background:'#dc2626',color:'white',border:'none',borderRadius:12,padding:'12px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer'}}>تأكيد</button>
              <button onClick={()=>setConfirm(false)} style={{flex:1,background:BDARK,border:'none',borderRadius:12,padding:'12px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',color:'#374151'}}>إلغاء</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
