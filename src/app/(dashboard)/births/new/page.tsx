'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

export default function NewBirthPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [momId, setMomId] = useState('')
  const [birthDate, setBirthDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [babies, setBabies] = useState([{animal_id:'', gender:'أنثى', health:'سليم'}])
  const [saving, setSaving] = useState(false)

  function addBaby() { setBabies(p=>[...p,{animal_id:'',gender:'أنثى',health:'سليم'}]) }
  function removeBaby(i:number) { if(babies.length>1) setBabies(p=>p.filter((_,idx)=>idx!==i)) }
  function updateBaby(i:number, k:string, v:string) { setBabies(p=>p.map((b,idx)=>idx===i?{...b,[k]:v}:b)) }

  async function handleSave(e:React.FormEvent) {
    e.preventDefault()
    if (!momId.trim()) { toast.error('رقم الأم مطلوب'); return }
    if (babies.some(b => !b.animal_id.trim())) { toast.error('رقم المولود مطلوب'); return }
    setSaving(true)
    const type = babies.length===1?'مفرد':babies.length===2?'توأم':'ثلاثة'
    const res = await fetch('/api/births',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mom_id:momId,birth_date:birthDate,birth_type:type,notes,babies})})
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    toast.success('✅ تم حفظ سجل الولادة')
    router.push('/births')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="page-header mb-6">
        <button onClick={()=>router.back()} className="text-gray-500 hover:text-gray-900 text-sm">→ رجوع</button>
        <h1 className="page-title">🐑 ولادة جديدة</h1>
        <div/>
      </div>
      <form onSubmit={handleSave} className="card space-y-5">
        <div>
          <label className="label">رقم الأم *</label>
          <input className="input" placeholder="1001" value={momId} onChange={e=>setMomId(e.target.value)} required />
        </div>
        <div>
          <label className="label">تاريخ الولادة *</label>
          <input type="date" className="input" value={birthDate} max={today} onChange={e=>setBirthDate(e.target.value)} required />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">المواليد ({babies.length})</label>
            <button type="button" onClick={addBaby} className="text-xs text-green-primary hover:underline">+ إضافة</button>
          </div>
          <div className="space-y-3">
            {babies.map((baby,i) => (
              <div key={i} className="bg-beige-primary border border-beige-border rounded-2xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500">المولود {i+1}</p>
                  {babies.length > 1 && <button type="button" onClick={()=>removeBaby(i)} className="text-xs text-red-400">✕ حذف</button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">رقم المولود *</label>
                    <input className="input text-sm" placeholder="2001" value={baby.animal_id} onChange={e=>updateBaby(i,'animal_id',e.target.value)} required />
                  </div>
                  <div>
                    <label className="label text-xs">الحالة</label>
                    <select className="input text-sm" value={baby.health} onChange={e=>updateBaby(i,'health',e.target.value)}>
                      {['سليم','مريض','ضعيف','نفوق'].map(h=><option key={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['ذكر','أنثى'].map(g=>(
                    <button key={g} type="button" onClick={()=>updateBaby(i,'gender',g)}
                      className={cn('flex-1 py-2 rounded-xl text-sm font-medium border transition-colors', baby.gender===g?'bg-green-primary text-white border-green-primary':'bg-white border-beige-border')}>
                      {g==='ذكر'?'🐏 ذكر':'🐑 أنثى'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="label">ملاحظات</label>
          <textarea className="input resize-none" rows={2} value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving?'⏳ جاري...':'💾 حفظ'}</button>
          <button type="button" onClick={()=>router.back()} className="btn-secondary px-5">إلغاء</button>
        </div>
      </form>
    </div>
  )
}
