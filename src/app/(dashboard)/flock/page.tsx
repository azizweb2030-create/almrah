'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function FlockPage() {
  const [flock, setFlock] = useState<any>(null)
  const [rams, setRams] = useState<any[]>([])
  const [tab, setTab] = useState('flock')
  const [editing, setEditing] = useState(false)
  const [totalSheep, setTotalSheep] = useState(0)
  const [ramForm, setRamForm] = useState({ram_id:'',name:'',color:''})
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/flock').then(r=>r.json()).then(j=>{setFlock(j.data);setTotalSheep(j.data?.total_sheep||0)})
    fetch('/api/rams').then(r=>r.json()).then(j=>setRams(j.data||[]))
  }, [])

  async function saveFlock() {
    setSaving(true)
    const res = await fetch('/api/flock',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({total_sheep:totalSheep})})
    const j = await res.json()
    setFlock(j.data); setEditing(false); setSaving(false); toast.success('تم الحفظ')
  }

  async function addRam() {
    if (!ramForm.ram_id.trim()) { toast.error('رقم الفحل مطلوب'); return }
    setSaving(true)
    const res = await fetch('/api/rams',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ramForm)})
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    setRams(p=>[j.data,...p]); setShowNew(false); setRamForm({ram_id:'',name:'',color:''}); setSaving(false); toast.success('تمت الإضافة')
  }

  async function markRamDead(id:string) {
    await fetch(`/api/rams/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({dead:true})})
    setRams(p=>p.map(r=>r.id===id?{...r,dead:true}:r)); toast.success('تم تحديث حالة الفحل')
  }

  const activeRams = rams.filter(r => !r.dead)
  const deadRams = rams.filter(r => r.dead)

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">📊 القطيع والفحول</h1>
        {tab==='flock'&&!editing && <button onClick={()=>setEditing(true)} className="btn-secondary text-sm px-3 py-1.5">✏️ تعديل</button>}
        {tab==='rams' && <button onClick={()=>setShowNew(p=>!p)} className="btn-primary text-sm">{showNew?'إلغاء':'＋ فحل'}</button>}
      </div>

      <div className="flex gap-2">
        {[{k:'flock',l:'🐑 القطيع'},{k:'rams',l:`🐏 الفحول (${activeRams.length})`}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${tab===t.k?'bg-green-primary text-white':'bg-white border-beige-border text-gray-600'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {tab==='flock' && (
        editing ? (
          <div className="card space-y-4">
            <h3 className="font-bold">تعديل إجمالي القطيع</h3>
            <div>
              <label className="label">إجمالي القطيع</label>
              <input type="number" min="0" className="input" value={totalSheep} onChange={e=>setTotalSheep(parseInt(e.target.value)||0)}/>
            </div>
            <div className="flex gap-2">
              <button onClick={saveFlock} className="btn-primary flex-1" disabled={saving}>{saving?'...':'💾 حفظ'}</button>
              <button onClick={()=>{setEditing(false);setTotalSheep(flock?.total_sheep||0)}} className="btn-secondary px-5">إلغاء</button>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <span className="text-3xl">🐑</span>
            <div className="stat-value">{flock?.total_sheep||0}</div>
            <div className="stat-label">إجمالي القطيع</div>
          </div>
        )
      )}

      {tab==='rams' && (
        <>
          {showNew && (
            <div className="card space-y-3">
              <h3 className="font-bold text-sm">إضافة فحل جديد</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label text-xs">رقم الفحل *</label><input className="input text-sm" value={ramForm.ram_id} onChange={e=>setRamForm(p=>({...p,ram_id:e.target.value}))}/></div>
                <div><label className="label text-xs">الاسم</label><input className="input text-sm" value={ramForm.name} onChange={e=>setRamForm(p=>({...p,name:e.target.value}))}/></div>
                <div className="col-span-2"><label className="label text-xs">اللون</label><input className="input text-sm" value={ramForm.color} onChange={e=>setRamForm(p=>({...p,color:e.target.value}))}/></div>
              </div>
              <div className="flex gap-2">
                <button onClick={addRam} className="btn-primary flex-1" disabled={saving}>{saving?'...':'💾 إضافة'}</button>
                <button onClick={()=>setShowNew(false)} className="btn-secondary px-5">إلغاء</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {rams.length===0 ? <div className="card text-center py-10 text-gray-400">لا توجد فحول مسجلة</div> : (
              rams.map((r:any) => (
                <div key={r.id} className={`card flex items-center justify-between ${r.dead?'opacity-50':''}`}>
                  <div>
                    <p className="font-bold text-sm">{r.ram_id}{r.name&&` — ${r.name}`}</p>
                    <p className="text-xs text-gray-500">{r.color||'—'} · {r.dead?'نافق':'نشط'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${r.dead?'badge-red':'badge-green'}`}>{r.dead?'نافق':'نشط'}</span>
                    {!r.dead && <button onClick={()=>markRamDead(r.id)} className="text-xs text-red-400 hover:text-red-600">نفوق</button>}
                  </div>
                </div>
              ))
            )}
          </div>
          {deadRams.length>0 && <p className="text-xs text-center text-gray-400">{deadRams.length} فحل نافق</p>}
        </>
      )}
    </div>
  )
}
