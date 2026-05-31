'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const G = '#1e5a10', GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'
const GOLD = '#c9a84c', GOLDD = '#a8872e', GOLDS = '#fdf8ec'
const COLORS = ['أبيض','أسود','بني','رمادي','أحمر','مختلط']

const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}
const inp: React.CSSProperties = {width:'100%',background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:12,padding:'11px 14px',fontFamily:'inherit',fontSize:14,outline:'none',boxSizing:'border-box' as const,color:'#111827'}
const lbl: React.CSSProperties = {display:'block',fontSize:12,fontWeight:700,color:'#6b7280',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:0.5}

export default function NewBirthPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [momId, setMomId] = useState('')
  const [momColor, setMomColor] = useState('')
  const [birthDate, setBirthDate] = useState(today)
  const [inBreeding, setInBreeding] = useState(false)
  const [babies, setBabies] = useState([{ baby_id:'', color:'', gender:'رخل', health:'سليم' }])
  const [saving, setSaving] = useState(false)

  function addBaby() { setBabies(p=>[...p,{baby_id:'',color:'',gender:'رخل',health:'سليم'}]) }
  function removeBaby(i:number) { if(babies.length>1) setBabies(p=>p.filter((_,idx)=>idx!==i)) }
  function updateBaby(i:number,k:string,v:string) { setBabies(p=>p.map((b,idx)=>idx===i?{...b,[k]:v}:b)) }

  const breedStart = (() => { const d=new Date(birthDate); d.setDate(d.getDate()+15); return d.toISOString().split('T')[0] })()
  const expectedBirth = (() => { const d=new Date(birthDate); d.setDate(d.getDate()+165); return d.toISOString().split('T')[0] })()

  async function handleSave(e:React.FormEvent) {
    e.preventDefault()
    if (!momId.trim()) { toast.error('رقم الأم مطلوب'); return }
    if (babies.some(b=>!b.baby_id.trim())) { toast.error('رقم المولود مطلوب'); return }
    setSaving(true)
    const breedingDate = inBreeding ? breedStart : null
    const res = await fetch('/api/births',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({mom_id:momId,mom_color:momColor,birth_date:birthDate,babies,in_breeding:inBreeding,breeding_date:breedingDate})
    })
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    toast.success('تم حفظ سجل الولادة ✅')
    router.push('/births')
  }

  return (
    <div style={{maxWidth:520,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={()=>router.back()} style={{background:BDARK,border:'none',borderRadius:10,width:36,height:36,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <h1 style={{fontSize:20,fontWeight:900,color:G,margin:0}}>ولادة جديدة</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'2px 0 0'}}>أدخل بيانات الأم والمواليد</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:14}}>

        {/* بيانات الأم */}
        <div style={card}>
          <p style={{fontSize:12,fontWeight:800,color:'#9ca3af',margin:'0 0 14px',textTransform:'uppercase',letterSpacing:1}}>بيانات الأم</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <label style={lbl}>رقم الأم *</label>
              <input style={inp} placeholder="مثال: 1001" inputMode="numeric" value={momId} onChange={e=>setMomId(e.target.value)} required />
            </div>
            <div>
              <label style={lbl}>لون الأم</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {COLORS.map(c=>(
                  <button key={c} type="button" onClick={()=>setMomColor(c===momColor?'':c)}
                    style={{padding:'7px 14px',borderRadius:22,border:`1.5px solid ${c===momColor?G:BDR}`,background:c===momColor?G:'white',color:c===momColor?'white':'#374151',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .15s'}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>تاريخ الولادة *</label>
              <input type="date" style={inp} value={birthDate} max={today} onChange={e=>setBirthDate(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* شبك التلقيح */}
        <div style={{...card, background:inBreeding?GOLDS:BEIGE, borderColor:inBreeding?`${GOLD}55`:BDR, borderWidth:1.5}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:inBreeding?12:0}}>
            <div>
              <p style={{margin:0,fontWeight:800,fontSize:14,color:inBreeding?GOLDD:'#374151'}}>🔗 شبك التلقيح</p>
              <p style={{margin:'3px 0 0',fontSize:11,color:'#9ca3af'}}>يبدأ بعد 15 يوم · حمل 150 يوم</p>
            </div>
            <button type="button" onClick={()=>setInBreeding(p=>!p)}
              style={{width:50,height:26,borderRadius:100,border:'none',cursor:'pointer',transition:'all .2s',background:inBreeding?GOLD:'#d1d5db',position:'relative',flexShrink:0}}>
              <span style={{position:'absolute',top:3,transition:'all .2s',width:20,height:20,background:'white',borderRadius:'50%',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',right:inBreeding?3:27}}/>
            </button>
          </div>
          {inBreeding && (
            <div style={{background:'white',borderRadius:12,padding:'10px 12px',fontSize:12,color:GOLDD,fontWeight:600}}>
              📅 بداية الشبك: <strong>{breedStart}</strong> &nbsp;·&nbsp; الولادة المتوقعة: <strong>{expectedBirth}</strong>
            </div>
          )}
        </div>

        {/* المواليد */}
        <div style={card}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <p style={{fontSize:12,fontWeight:800,color:'#9ca3af',margin:0,textTransform:'uppercase',letterSpacing:1}}>المواليد ({babies.length})</p>
            <button type="button" onClick={addBaby}
              style={{background:GSUBT,border:'none',borderRadius:10,padding:'6px 12px',color:G,fontFamily:'inherit',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              + إضافة مولود
            </button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {babies.map((baby,i)=>(
              <div key={i} style={{background:BEIGE,borderRadius:16,padding:14,border:`1px solid ${BDR}`}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <p style={{margin:0,fontSize:12,fontWeight:800,color:'#6b7280'}}>المولود {i+1}</p>
                  {babies.length>1 && (
                    <button type="button" onClick={()=>removeBaby(i)}
                      style={{background:'#fef2f2',border:'none',borderRadius:8,padding:'4px 10px',color:'#dc2626',fontFamily:'inherit',fontSize:12,cursor:'pointer'}}>
                      ✕ حذف
                    </button>
                  )}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  <div>
                    <label style={{...lbl,fontSize:11}}>رقم المولود *</label>
                    <input style={{...inp,fontSize:13}} placeholder="2001" inputMode="numeric" value={baby.baby_id} onChange={e=>updateBaby(i,'baby_id',e.target.value)} required />
                  </div>
                  <div>
                    <label style={{...lbl,fontSize:11}}>الحالة</label>
                    <select style={{...inp,fontSize:13}} value={baby.health} onChange={e=>updateBaby(i,'health',e.target.value)}>
                      {['سليم','مريض','ضعيف','نفوق'].map(h=><option key={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                {/* النوع */}
                <div style={{display:'flex',gap:8,marginBottom:10}}>
                  {[{v:'رخل',l:'🐑 رخل (أنثى)'},{v:'خروف',l:'🐏 خروف (ذكر)'}].map(g=>(
                    <button key={g.v} type="button" onClick={()=>updateBaby(i,'gender',g.v)}
                      style={{flex:1,padding:'9px',borderRadius:12,border:`1.5px solid ${baby.gender===g.v?G:BDR}`,background:baby.gender===g.v?G:'white',color:baby.gender===g.v?'white':'#374151',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                      {g.l}
                    </button>
                  ))}
                </div>
                {/* اللون */}
                <div>
                  <label style={{...lbl,fontSize:11}}>اللون</label>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    {COLORS.map(c=>(
                      <button key={c} type="button" onClick={()=>updateBaby(i,'color',c===baby.color?'':c)}
                        style={{padding:'5px 10px',borderRadius:8,border:`1px solid ${c===baby.color?G:BDR}`,background:c===baby.color?G:'white',color:c===baby.color?'white':'#374151',fontFamily:'inherit',fontSize:11,cursor:'pointer'}}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* أزرار */}
        <div style={{display:'flex',gap:10}}>
          <button type="submit" disabled={saving}
            style={{flex:1,background:`linear-gradient(135deg,${G},#4a9e30)`,color:'white',border:'none',borderRadius:14,padding:'14px',fontFamily:'inherit',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:`0 4px 14px ${G}44`,opacity:saving?0.7:1}}>
            {saving?'⏳ جاري الحفظ...':'💾 حفظ الولادة'}
          </button>
          <button type="button" onClick={()=>router.back()}
            style={{background:BDARK,border:'none',borderRadius:14,padding:'14px 20px',fontFamily:'inherit',fontSize:15,fontWeight:700,cursor:'pointer',color:'#374151'}}>
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
