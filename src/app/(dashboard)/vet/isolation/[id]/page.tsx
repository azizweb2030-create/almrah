'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'

const G = '#1e5a10', GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3'
const GOLD = '#c9a84c', GOLDD = '#a8872e', GOLDS = '#fdf8ec'
const card: React.CSSProperties = { background:'white', borderRadius:20, border:`1px solid ${BDR}`, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }

export default function VetIsolationDetailPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [c, setC] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logForm, setLogForm] = useState({ date: new Date().toISOString().split('T')[0], note: '', temp: '' })
  const [showLog, setShowLog] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // B4 FIX: جلب record واحد مباشرة عبر GET /api/vet/isolation/[id]
    fetch(`/api/vet/isolation/${id}`)
      .then(r => r.json())
      .then(j => { setC(j.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function closeCase() {
    setSaving(true)
    const res = await fetch(`/api/vet/isolation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false, end_date: new Date().toISOString().split('T')[0] })
    })
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    setC((p: any) => ({ ...p, active: false }))
    setSaving(false)
    toast.success('✅ تم إغلاق الحالة')
  }

  async function addLog() {
    if (!logForm.note.trim()) { toast.error('اكتب ملاحظة'); return }
    setSaving(true)
    const existing = c.extended_log || []
    const newLog = [...existing, { date: logForm.date, note: logForm.note, temp: logForm.temp || null }]
    const res = await fetch(`/api/vet/isolation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extended_log: newLog })
    })
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    setC((p: any) => ({ ...p, extended_log: newLog }))
    setLogForm({ date: new Date().toISOString().split('T')[0], note: '', temp: '' })
    setShowLog(false)
    setSaving(false)
    toast.success('✅ تمت إضافة المتابعة')
  }

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {[...Array(3)].map((_,i) => <div key={i} style={{ height:80, borderRadius:20, background:BEIGE }} className="skeleton"/>)}
    </div>
  )

  if (!c) return (
    <div style={{ textAlign:'center', padding:'80px 16px' }}>
      <p style={{ color:'#6b7280', marginBottom:16 }}>الحالة غير موجودة</p>
      <button onClick={() => router.push('/vet')} style={{ background:G, color:'white', border:'none', borderRadius:12, padding:'10px 24px', cursor:'pointer', fontFamily:'inherit' }}>العودة</button>
    </div>
  )

  const logs = c.extended_log || []
  const severityColor = c.severity === 'حرجة' ? '#dc2626' : c.severity === 'متوسطة' ? '#d97706' : G

  return (
    <div style={{ maxWidth:600, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={() => router.push('/vet')} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontSize:14, fontFamily:'inherit' }}>→ رجوع</button>
        <h1 style={{ fontSize:22, fontWeight:900, color:G, margin:0 }}>🩺 {c.animal_id}</h1>
        <div/>
      </div>

      {/* بيانات الحالة */}
      <div style={{ ...card }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:16 }}>
          <span style={{ fontSize:20, fontWeight:900 }}>{c.animal_id}</span>
          {c.severity && (
            <span style={{ background:`${severityColor}15`, color:severityColor, borderRadius:100, padding:'2px 10px', fontSize:11, fontWeight:700 }}>{c.severity}</span>
          )}
          <span style={{ background:c.active?'#fef2f2':'#f0fdf4', color:c.active?'#dc2626':G, borderRadius:100, padding:'2px 10px', fontSize:11, fontWeight:700 }}>
            {c.active ? '🔴 نشط' : '✅ مُغلق'}
          </span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { l:'المرض / الحالة', v: c.disease || c.status || '—' },
            { l:'تاريخ البداية', v: c.start_date },
            { l:'الدواء', v: c.medicine || '—' },
            { l:'ملاحظات', v: c.usage_notes || '—' },
          ].map(item => (
            <div key={item.l} style={{ background:BEIGE, borderRadius:12, padding:'10px 12px' }}>
              <p style={{ margin:0, fontSize:11, color:'#6b7280', marginBottom:3 }}>{item.l}</p>
              <p style={{ margin:0, fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* المتابعة اليومية */}
      <div style={{ ...card }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:700 }}>📋 المتابعة اليومية ({logs.length})</h2>
          {c.active && (
            <button onClick={() => setShowLog(p => !p)}
              style={{ background:G, color:'white', border:'none', borderRadius:10, padding:'6px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              {showLog ? 'إلغاء' : '＋ متابعة'}
            </button>
          )}
        </div>

        {showLog && (
          <div style={{ background:BEIGE, borderRadius:16, padding:14, marginBottom:16, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={{ display:'block', fontSize:12, color:'#6b7280', marginBottom:4 }}>التاريخ</label>
                <input type="date" value={logForm.date} onChange={e => setLogForm(p => ({ ...p, date: e.target.value }))}
                  style={{ width:'100%', background:'white', border:`1px solid ${BDR}`, borderRadius:10, padding:'8px 12px', fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, color:'#6b7280', marginBottom:4 }}>الحرارة °م</label>
                <input type="number" step="0.1" placeholder="38.5" value={logForm.temp} onChange={e => setLogForm(p => ({ ...p, temp: e.target.value }))}
                  style={{ width:'100%', background:'white', border:`1px solid ${BDR}`, borderRadius:10, padding:'8px 12px', fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }}/>
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, color:'#6b7280', marginBottom:4 }}>الملاحظة *</label>
              <textarea rows={2} value={logForm.note} onChange={e => setLogForm(p => ({ ...p, note: e.target.value }))}
                placeholder="الحالة اليوم، العلاج المُعطى..."
                style={{ width:'100%', background:'white', border:`1px solid ${BDR}`, borderRadius:10, padding:'8px 12px', fontSize:13, fontFamily:'inherit', resize:'none', boxSizing:'border-box' }}/>
            </div>
            <button onClick={addLog} disabled={saving}
              style={{ background:G, color:'white', border:'none', borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>
              {saving ? '⏳...' : '💾 حفظ'}
            </button>
          </div>
        )}

        {logs.length === 0 ? (
          <p style={{ textAlign:'center', color:'#9ca3af', fontSize:14, padding:'24px 0' }}>لا توجد متابعات بعد</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[...logs].reverse().map((log: any, i: number) => (
              <div key={i} style={{ display:'flex', gap:12, padding:'10px 12px', background:BEIGE, borderRadius:12 }}>
                <p style={{ margin:0, fontSize:12, color:'#9ca3af', flexShrink:0, paddingTop:2 }}>{log.date}</p>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:14 }}>{log.note}</p>
                  {log.temp && <p style={{ margin:'4px 0 0', fontSize:12, color:'#6b7280' }}>🌡️ {log.temp}°م</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* إغلاق */}
      {c.active && (
        <div style={{ ...card }}>
          <button onClick={closeCase} disabled={saving}
            style={{ width:'100%', padding:'10px', background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:600, color:G, fontFamily:'inherit' }}>
            ✅ إغلاق الحالة (تعافى)
          </button>
        </div>
      )}
    </div>
  )
}
