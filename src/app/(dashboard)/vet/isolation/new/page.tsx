'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

export default function NewIsolationPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({animal_id:'',animal_type:'أم',start_date:today,reason:'',severity:'متوسط',medicine:'',notes:''})
  const [saving, setSaving] = useState(false)
  const set = (k:string, v:string) => setForm(p=>({...p,[k]:v}))

  async function save(e:React.FormEvent) {
    e.preventDefault()
    if (!form.animal_id.trim()||!form.reason.trim()) { toast.error('يرجى ملء الحقول المطلوبة'); return }
    setSaving(true)
    const res = await fetch('/api/vet/isolation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    toast.success('✅ تم إضافة حالة العزل'); router.push('/vet')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="page-header mb-6">
        <button onClick={()=>router.back()} className="text-gray-500 text-sm">→ رجوع</button>
        <h1 className="page-title">🩺 حالة عزل جديدة</h1>
        <div/>
      </div>
      <form onSubmit={save} className="card space-y-4">
        <div>
          <label className="label">درجة الخطورة</label>
          <div className="grid grid-cols-2 gap-2">
            {['طارئ','حرج','متوسط','خفيف'].map(s=>(
              <button key={s} type="button" onClick={()=>set('severity',s)}
                className={cn('py-2.5 rounded-xl text-sm font-medium border transition-colors', form.severity===s?'bg-green-primary text-white':'bg-white border-beige-border')}>
                {s==='طارئ'?'🚨 طارئ':s==='حرج'?'⚠️ حرج':s==='متوسط'?'🔔 متوسط':'✅ خفيف'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">رقم الحيوان *</label><input className="input" value={form.animal_id} onChange={e=>set('animal_id',e.target.value)} required /></div>
          <div><label className="label">النوع</label>
            <select className="input" value={form.animal_type} onChange={e=>set('animal_type',e.target.value)}>
              {['أم','مولود','فحل','أخرى'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div><label className="label">تاريخ العزل</label><input type="date" className="input" value={form.start_date} max={today} onChange={e=>set('start_date',e.target.value)}/></div>
        <div><label className="label">سبب العزل *</label><textarea className="input resize-none" rows={2} value={form.reason} onChange={e=>set('reason',e.target.value)} required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">الدواء</label><input className="input" value={form.medicine} onChange={e=>set('medicine',e.target.value)}/></div>
          <div><label className="label">ملاحظات</label><input className="input" value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving?'⏳...':'💾 حفظ'}</button>
          <button type="button" onClick={()=>router.back()} className="btn-secondary px-5">إلغاء</button>
        </div>
      </form>
    </div>
  )
}
