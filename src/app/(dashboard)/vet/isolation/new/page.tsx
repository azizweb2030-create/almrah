'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const G = '#1e5a10', GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'
const DISEASES = ['إسهال','التهاب رئوي','حمى','جرح خارجي','ضعف عام','فقدان شهية','أخرى']
const SEVERITIES = [
  {v:'عادية', icon:'✅', bg:'#f0fdf4', color:'#16a34a', border:'#86efac'},
  {v:'متوسطة', icon:'⚠️', bg:'#fffbeb', color:'#d97706', border:'#fcd34d'},
  {v:'حرجة', icon:'🚨', bg:'#fef2f2', color:'#dc2626', border:'#fca5a5'},
]
const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}
const inp: React.CSSProperties = {width:'100%',background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:12,padding:'11px 14px',fontFamily:'inherit',fontSize:14,outline:'none',boxSizing:'border-box' as const,color:'#111827'}
const lbl: React.CSSProperties = {display:'block',fontSize:12,fontWeight:700,color:'#6b7280',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:0.5}

export default function NewIsolationPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({animal_id:'',disease:'',disease_other:'',treatment:'',duration_text:'',start_date:today,severity:'عادية'})
  const [saving, setSaving] = useState(false)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  async function save(e:React.FormEvent) {
    e.preventDefault()
    if (!form.animal_id.trim()||!form.disease) { toast.error('رقم الحيوان والمرض مطلوبان'); return }
    if (form.disease==='أخرى'&&!form.disease_other.trim()) { toast.error('اكتب اسم المرض'); return }
    setSaving(true)
    const res = await fetch('/api/vet/isolation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    toast.success('تمت إضافة حالة العزل ✅')
    router.push('/vet')
  }

  const sevCfg = SEVERITIES.find(s=>s.v===form.severity)!

  return (
    <div style={{maxWidth:520,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={()=>router.back()} style={{background:BDARK,border:'none',borderRadius:10,width:36,height:36,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <h1 style={{fontSize:20,fontWeight:900,color:'#1d4ed8',margin:0}}>عزل بيطري جديد</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'2px 0 0'}}>أدخل بيانات الحيوان</p>
        </div>
      </div>

      <form onSubmit={save} style={{display:'flex',flexDirection:'column',gap:14}}>

        {/* درجة الخطورة */}
        <div style={card}>
          <label style={lbl}>درجة الخطورة</label>
          <div style={{display:'flex',gap:8}}>
            {SEVERITIES.map(s=>(
              <button key={s.v} type="button" onClick={()=>set('severity',s.v)}
                style={{flex:1,padding:'10px 8px',borderRadius:14,border:`1.5px solid ${form.severity===s.v?s.border:BDR}`,background:form.severity===s.v?s.bg:'white',color:form.severity===s.v?s.color:'#6b7280',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                <div style={{fontSize:18,marginBottom:3}}>{s.icon}</div>
                {s.v}
              </button>
            ))}
          </div>
        </div>

        <div style={card}>
          <p style={{fontSize:12,fontWeight:800,color:'#9ca3af',margin:'0 0 14px',textTransform:'uppercase',letterSpacing:1}}>بيانات الحالة</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <label style={lbl}>رقم الحيوان *</label>
              <input style={inp} placeholder="مثال: 1001" inputMode="numeric" value={form.animal_id} onChange={e=>set('animal_id',e.target.value)} required />
            </div>
            <div>
              <label style={lbl}>المرض / الحالة *</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:form.disease==='أخرى'?8:0}}>
                {DISEASES.map(d=>(
                  <button key={d} type="button" onClick={()=>set('disease',d)}
                    style={{padding:'7px 14px',borderRadius:22,border:`1.5px solid ${d===form.disease?'#1d4ed8':BDR}`,background:d===form.disease?'#1d4ed8':'white',color:d===form.disease?'white':'#374151',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                    {d}
                  </button>
                ))}
              </div>
              {form.disease==='أخرى' && (
                <input style={inp} placeholder="اكتب اسم المرض..." value={form.disease_other} onChange={e=>set('disease_other',e.target.value)} required />
              )}
            </div>
            <div>
              <label style={lbl}>تاريخ العزل</label>
              <input type="date" style={inp} value={form.start_date} max={today} onChange={e=>set('start_date',e.target.value)} />
            </div>
            <div>
              <label style={lbl}>العلاج / الدواء</label>
              <input style={inp} placeholder="اسم الدواء أو طريقة العلاج..." value={form.treatment} onChange={e=>set('treatment',e.target.value)} />
            </div>
            <div>
              <label style={lbl}>المدة المتوقعة</label>
              <input style={inp} placeholder="3 أيام، أسبوع، حتى التعافي..." value={form.duration_text} onChange={e=>set('duration_text',e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:10}}>
          <button type="submit" disabled={saving}
            style={{flex:1,background:'linear-gradient(135deg,#1d4ed8,#3b82f6)',color:'white',border:'none',borderRadius:14,padding:'14px',fontFamily:'inherit',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 14px rgba(29,78,216,0.3)',opacity:saving?0.7:1}}>
            {saving?'⏳ جاري الحفظ...':'💾 حفظ حالة العزل'}
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
