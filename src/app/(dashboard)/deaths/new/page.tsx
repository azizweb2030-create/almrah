'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const G = '#1e5a10', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'
const CATEGORIES = ['بهم','خروف','رخل','أم','فحل','غير محدد']
const COLORS = ['أبيض','أسود','بني','رمادي','أحمر','مختلط']
const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}
const inp: React.CSSProperties = {width:'100%',background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:12,padding:'11px 14px',fontFamily:'inherit',fontSize:14,outline:'none',boxSizing:'border-box' as const,color:'#111827'}
const lbl: React.CSSProperties = {display:'block',fontSize:12,fontWeight:700,color:'#6b7280',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:0.5}

export default function NewDeathPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({animal_id:'',color:'',category:'غير محدد',reason:'',death_date:today,mom_id:'',mom_color:''})
  const [saving, setSaving] = useState(false)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  async function save(e:React.FormEvent) {
    e.preventDefault()
    if (!form.animal_id.trim()) { toast.error('رقم الحيوان مطلوب'); return }
    setSaving(true)
    const res = await fetch('/api/deaths',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    toast.success('تم تسجيل النفوق وخصمه تلقائياً ✅')
    router.push('/deaths')
  }

  return (
    <div style={{maxWidth:520,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={()=>router.back()} style={{background:BDARK,border:'none',borderRadius:10,width:36,height:36,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <h1 style={{fontSize:20,fontWeight:900,color:'#dc2626',margin:0}}>تسجيل نفوق</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'2px 0 0'}}>سيُخصم من الإجمالي تلقائياً</p>
        </div>
      </div>

      {/* تحذير */}
      <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:16,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:20,flexShrink:0}}>⚠️</span>
        <p style={{margin:0,fontSize:13,color:'#dc2626',fontWeight:600}}>سيتم خصم هذا الحيوان من إجمالي القطيع تلقائياً</p>
      </div>

      <form onSubmit={save} style={{display:'flex',flexDirection:'column',gap:14}}>
        <div style={card}>
          <p style={{fontSize:12,fontWeight:800,color:'#9ca3af',margin:'0 0 14px',textTransform:'uppercase',letterSpacing:1}}>بيانات الحيوان</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <label style={lbl}>رقم الحيوان *</label>
              <input style={inp} placeholder="مثال: 1001" inputMode="numeric" value={form.animal_id} onChange={e=>set('animal_id',e.target.value)} required />
            </div>
            <div>
              <label style={lbl}>الفئة</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {CATEGORIES.map(c=>(
                  <button key={c} type="button" onClick={()=>set('category',c)}
                    style={{padding:'7px 14px',borderRadius:22,border:`1.5px solid ${c===form.category?'#dc2626':BDR}`,background:c===form.category?'#dc2626':'white',color:c===form.category?'white':'#374151',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>اللون</label>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {COLORS.map(c=>(
                  <button key={c} type="button" onClick={()=>set('color',c===form.color?'':c)}
                    style={{padding:'6px 12px',borderRadius:10,border:`1px solid ${c===form.color?G:BDR}`,background:c===form.color?G:'white',color:c===form.color?'white':'#374151',fontFamily:'inherit',fontSize:12,cursor:'pointer'}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>تاريخ النفوق</label>
              <input type="date" style={inp} value={form.death_date} max={today} onChange={e=>set('death_date',e.target.value)} />
            </div>
            <div>
              <label style={lbl}>السبب (اختياري)</label>
              <input style={inp} placeholder="مرض، حادث، ولادة..." value={form.reason} onChange={e=>set('reason',e.target.value)} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label style={{...lbl,fontSize:11}}>رقم الأم (إن كان مولوداً)</label>
                <input style={{...inp,fontSize:13}} placeholder="1001" value={form.mom_id} onChange={e=>set('mom_id',e.target.value)} />
              </div>
              <div>
                <label style={{...lbl,fontSize:11}}>لون الأم</label>
                <input style={{...inp,fontSize:13}} placeholder="أبيض..." value={form.mom_color} onChange={e=>set('mom_color',e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:10}}>
          <button type="submit" disabled={saving}
            style={{flex:1,background:'linear-gradient(135deg,#991b1b,#ef4444)',color:'white',border:'none',borderRadius:14,padding:'14px',fontFamily:'inherit',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 14px rgba(220,38,38,0.3)',opacity:saving?0.7:1}}>
            {saving?'⏳ جاري التسجيل...':'📋 تسجيل النفوق'}
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
