'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

const DISEASES = ['إسهال','التهاب رئوي','حمى','جرح','ضعف عام','أخرى']
const SEVERITIES = ['عادية','متوسطة','حرجة']

export default function NewIsolationPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({animal_id:'',disease:'',disease_other:'',treatment:'',duration_text:'',start_date:today,severity:'عادية'})
  const [saving, setSaving] = useState(false)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  async function save(e:React.FormEvent) {
    e.preventDefault()
    if (!form.animal_id.trim()||!form.disease.trim()) { toast.error('رقم الحيوان والمرض مطلوبان'); return }
    setSaving(true)
    const res = await fetch('/api/vet/isolation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    toast.success('✅ تم إضافة حالة العزل')
    router.push('/vet')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="page-header mb-6">
        <button onClick={()=>router.back()} className="text-gray-500 text-sm">→ رجوع</button>
        <h1 className="page-title">🩺 عزل جديد</h1>
        <div/>
      </div>
      <form onSubmit={save} className="card space-y-4">
        <div>
          <label className="label">درجة الخطورة</label>
          <div className="flex gap-2">
            {SEVERITIES.map(s=>(
              <button key={s} type="button" onClick={()=>set('severity',s)}
                className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium border', form.severity===s?'bg-green-primary text-white':'bg-white border-beige-border')}>
                {s==='حرجة'?'🚨 حرجة':s==='متوسطة'?'⚠️ متوسطة':'✅ عادية'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">رقم الحيوان *</label>
          <input className="input" value={form.animal_id} onChange={e=>set('animal_id',e.target.value)} required/>
        </div>
        <div>
          <label className="label">المرض *</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {DISEASES.map(d=>(
              <button key={d} type="button" onClick={()=>set('disease',d)}
                className={cn('px-3 py-1.5 rounded-xl text-sm border', form.disease===d?'bg-green-primary text-white':'bg-white border-beige-border')}>
                {d}
              </button>
            ))}
          </div>
          {form.disease==='أخرى' && <input className="input" placeholder="اكتب المرض..." value={form.disease_other} onChange={e=>set('disease_other',e.target.value)}/>}
        </div>
        <div>
          <label className="label">تاريخ البداية</label>
          <input type="date" className="input" value={form.start_date} max={today} onChange={e=>set('start_date',e.target.value)}/>
        </div>
        <div>
          <label className="label">العلاج</label>
          <input className="input" value={form.treatment} onChange={e=>set('treatment',e.target.value)} placeholder="اسم الدواء أو العلاج"/>
        </div>
        <div>
          <label className="label">المدة المتوقعة</label>
          <input className="input" value={form.duration_text} onChange={e=>set('duration_text',e.target.value)} placeholder="3 أيام، أسبوع..."/>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving?'⏳...':'💾 حفظ'}</button>
          <button type="button" onClick={()=>router.back()} className="btn-secondary px-5">إلغاء</button>
        </div>
      </form>
    </div>
  )
}
