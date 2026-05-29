'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function FlockPage() {
  const [flock, setFlock] = useState<any>(null)
  const [rams, setRams] = useState<any[]>([])
  const [tab, setTab] = useState('flock')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [ramForm, setRamForm] = useState({ram_id:'',name:'',breed:'',notes:''})
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/flock').then(r=>r.json()).then(j=>{setFlock(j.data);setForm(j.data||{})})
    fetch('/api/rams').then(r=>r.json()).then(j=>setRams(j.data||[]))
  }, [])

  const fields = ['total_count','productive_count','mating_count','bahm_count','rakhl_count','kharoof_count','death_count']
  const labels: Record<string,string> = {total_count:'الإجمالي',productive_count:'المنتجة',mating_count:'شبك',bahm_count:'البهم',rakhl_count:'الرخال',kharoof_count:'الخرفان',death_count:'النفوق'}

  async function saveFlock() {
    setSaving(true)
    const res = await fetch('/api/flock',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j = await res.json()
    setFlock(j.data); setEditing(false); setSaving(false); toast.success('تم الحفظ')
  }

  async function addRam() {
    if (!ramForm.ram_id.trim()) { toast.error('رقم الفحل مطلوب'); return }
    setSaving(true)
    const res = await fetch('/api/rams',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ramForm)})
    const j = await res.json()
    setRams(p=>[j.data,...p]); setShowNew(false); setSaving(false); toast.success('تمت الإضافة')
  }

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">📊 القطيع والفحول</h1>
        {tab==='flock'&&!editing && <button onClick={()=>setEditing(true)} className="btn-secondary text-sm px-3 py-1.5">✏️ تعديل</button>}
        {tab==='rams' && <button onClick={()=>setShowNew(p=>!p)} className="btn-primary text-sm">＋ فحل</button>}
      </div>
      <div className="flex gap-2">
        {[{k:'flock',l:'🐑 القطيع'},{k:'rams',l:'🐏 الفحول'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${tab===t.k?'bg-green-primary text-white':'bg-white border-beige-border text-gray-600'}`}>{t.l}</button>
        ))}
      </div>
      {tab==='flock' && (
        editing ? (
          <div className="card space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {fields.map(f=>(
                <div key={f}>
                  <label className="label text-xs">{labels[f]}</label>
                  <input type="number" min="0" className="input text-sm" value={form[f]||0} onChange={e=>setForm((p:any)=>({...p,[f]:parseInt(e.target.value)||0}))}/>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={saveFlock} className="btn-primary flex-1" disabled={saving}>{saving?'...':'💾 حفظ'}</button>
              <button onClick={()=>{setEditing(false);setForm(flock||{})}} className="btn-secondary px-5">إلغاء</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fields.map(f=>(
              <div key={f} className="stat-card">
                <div className="stat-value">{flock?.[f]||0}</div>
                <div className="stat-label">{labels[f]}</div>
              </div>
            ))}
          </div>
        )
      )}
      {tab==='rams' && (
        <>
          {showNew && (
            <div className="card space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[{k:'ram_id',l:'رقم الفحل *'},{k:'name',l:'الاسم'},{k:'breed',l:'السلالة'}].map(f=>(
                  <div key={f.k}><label className="label text-xs">{f.l}</label><input className="input text-sm" value={(ramForm as any)[f.k]} onChange={e=>setRamForm(p=>({...p,[f.k]:e.target.value}))}/></div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={addRam} className="btn-primary flex-1" disabled={saving}>{saving?'...':'💾 إضافة'}</button>
                <button onClick={()=>setShowNew(false)} className="btn-secondary px-5">إلغاء</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {rams.map((r:any) => (
              <div key={r.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-bold">{r.ram_id}{r.name&&` — ${r.name}`}</p>
                  <p className="text-xs text-gray-500">{r.breed||''} · {r.status}</p>
                </div>
                <span className="badge-green text-xs">{r.status}</span>
              </div>
            ))}
            {rams.length===0 && <div className="card text-center py-10 text-gray-400">لا توجد فحول</div>}
          </div>
        </>
      )}
    </div>
  )
}
