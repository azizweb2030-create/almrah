'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const G='#1e5a10', GSUBT='#e8f5e2', BEIGE='#f8f4ee', BDR='#d8cfc3', GOLD='#c9a84c'
const COLORS=['أبيض','أسود','بني','رمادي','أحمر','مختلط']
const HEALTH=['سليم','مريض','نافق']
const MEDS=['إبر B12','مضاد حيوي','فيتامينات','دواء إسهال','مضاد طفيليات','أدوية أخرى']

export default function NewBirthPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ mom_id:'', mom_color:'', birth_date:today, meds:[] as string[] })
  const [babies, setBabies] = useState([{ baby_id:'', color:'', gender:'رخل', health:'سليم' }])
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))
  const toggleMed = (m: string) => setForm(p => ({
    ...p,
    meds: p.meds.includes(m) ? p.meds.filter(x=>x!==m) : [...p.meds, m]
  }))
  const setBaby = (i: number, k: string, v: string) =>
    setBabies(p => p.map((b, idx) => idx===i ? { ...b, [k]: v } : b))
  const addBaby = () => setBabies(p => [...p, { baby_id:'', color:'', gender:'رخل', health:'سليم' }])
  const removeBaby = (i: number) => setBabies(p => p.filter((_,idx)=>idx!==i))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.mom_id.trim()) { toast.error('رقم الأم مطلوب'); return }
    if (babies.some(b => !b.baby_id.trim())) { toast.error('أدخل رقم لكل مولود'); return }
    setSaving(true)
    const res = await fetch('/api/births', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, babies })
    })
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    toast.success('✅ تم تسجيل الولادة')
    router.push('/births')
  }

  const inp: React.CSSProperties = { width:'100%', background:BEIGE, border:`1px solid ${BDR}`, borderRadius:12, padding:'10px 14px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }
  const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 }
  const card: React.CSSProperties = { background:'white', borderRadius:20, border:`1px solid ${BDR}`, padding:20, marginBottom:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }

  return (
    <div style={{ maxWidth:520, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontSize:14, fontFamily:'inherit' }}>→ رجوع</button>
        <h1 style={{ fontSize:22, fontWeight:900, color:G, margin:0 }}>🐑 تسجيل ولادة</h1>
        <div/>
      </div>

      <form onSubmit={save}>
        {/* بيانات الأم */}
        <div style={card}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:16, color:G }}>بيانات الأم</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbl}>رقم الأم *</label>
              <input style={inp} placeholder="مثال: 1001" value={form.mom_id} onChange={e=>set('mom_id',e.target.value)} required/>
            </div>
            <div>
              <label style={lbl}>تاريخ الولادة</label>
              <input type="date" style={inp} max={today} value={form.birth_date} onChange={e=>set('birth_date',e.target.value)}/>
            </div>
            <div>
              <label style={lbl}>لون الأم</label>
              <select style={inp} value={form.mom_color} onChange={e=>set('mom_color',e.target.value)}>
                <option value="">اختر...</option>
                {COLORS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* الأدوية */}
          <div style={{ marginTop:14 }}>
            <label style={lbl}>الأدوية المعطاة للأم (اختياري)</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {MEDS.map(m=>(
                <button key={m} type="button" onClick={()=>toggleMed(m)}
                  style={{ padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', border:'none',
                    background:form.meds.includes(m)?G:BEIGE, color:form.meds.includes(m)?'white':'#374151' }}>
                  {form.meds.includes(m)?'✓ ':''}{m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* المواليد */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:G, margin:0 }}>🍼 المواليد ({babies.length})</h2>
            <button type="button" onClick={addBaby}
              style={{ background:GSUBT, color:G, border:'none', borderRadius:12, padding:'6px 14px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              ＋ مولود
            </button>
          </div>

          {babies.map((b, i) => (
            <div key={i} style={{ background:BEIGE, borderRadius:16, padding:14, marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:600 }}>مولود {i+1}</span>
                {babies.length > 1 && (
                  <button type="button" onClick={() => removeBaby(i)}
                    style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:16 }}>✕</button>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={lbl}>رقم المولود *</label>
                  <input style={{...inp, background:'white'}} placeholder="1001-1" value={b.baby_id} onChange={e=>setBaby(i,'baby_id',e.target.value)} required/>
                </div>
                <div>
                  <label style={lbl}>الجنس</label>
                  <div style={{ display:'flex', gap:6 }}>
                    {['رخل','خروف'].map(g=>(
                      <button key={g} type="button" onClick={()=>setBaby(i,'gender',g)}
                        style={{ flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600,
                          background:b.gender===g?G:BEIGE, color:b.gender===g?'white':'#374151' }}>
                        {g==='رخل'?'♀ رخل':'♂ خروف'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl}>اللون</label>
                  <select style={{...inp, background:'white'}} value={b.color} onChange={e=>setBaby(i,'color',e.target.value)}>
                    <option value="">اختر...</option>
                    {COLORS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>الحالة الصحية</label>
                  <select style={{...inp, background:'white'}} value={b.health} onChange={e=>setBaby(i,'health',e.target.value)}>
                    {HEALTH.map(h=><option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={saving}
          style={{ width:'100%', background:G, color:'white', border:'none', borderRadius:16, padding:'14px', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>
          {saving ? '⏳ جاري الحفظ...' : '🐑 حفظ سجل الولادة'}
        </button>
      </form>
    </div>
  )
}
