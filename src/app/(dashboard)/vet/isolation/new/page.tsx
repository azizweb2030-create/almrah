'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

const DISEASES = ['إسهال','التهاب رئوي','حمى','جرح خارجي','ضعف عام','فقدان شهية','أخرى']
const SEVERITIES = [
  { v:'عادية', icon:'✅', cls:'bg-green-subtle text-green-primary border-green-primary/30' },
  { v:'متوسطة', icon:'⚠️', cls:'bg-amber-50 text-amber-700 border-amber-300' },
  { v:'حرجة', icon:'🚨', cls:'bg-red-50 text-red-600 border-red-300' },
]

export default function NewIsolationPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    animal_id:'', disease:'', disease_other:'',
    treatment:'', duration_text:'', start_date:today, severity:'عادية'
  })
  const [saving, setSaving] = useState(false)
  const set = (k:string, v:string) => setForm(p=>({...p,[k]:v}))

  async function save(e:React.FormEvent) {
    e.preventDefault()
    if (!form.animal_id.trim()||!form.disease) { toast.error('رقم الحيوان والمرض مطلوبان'); return }
    if (form.disease==='أخرى' && !form.disease_other.trim()) { toast.error('اكتب اسم المرض'); return }
    setSaving(true)
    const res = await fetch('/api/vet/isolation',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(form)
    })
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
      <form onSubmit={save} className="card space-y-5">
        {/* درجة الخطورة أولاً */}
        <div>
          <label className="label">درجة الخطورة</label>
          <div className="flex gap-2">
            {SEVERITIES.map(s=>(
              <button key={s.v} type="button" onClick={()=>set('severity',s.v)}
                className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                  form.severity===s.v?s.cls:'bg-white border-beige-border text-gray-600')}>
                {s.icon} {s.v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">رقم الحيوان *</label>
          <input className="input" placeholder="1001" value={form.animal_id} onChange={e=>set('animal_id',e.target.value)} required />
        </div>

        <div>
          <label className="label">المرض / الحالة *</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {DISEASES.map(d=>(
              <button key={d} type="button" onClick={()=>set('disease',d)}
                className={cn('px-3 py-1.5 rounded-xl text-sm border transition-colors',
                  form.disease===d?'bg-green-primary text-white border-green-primary':'bg-white border-beige-border')}>
                {d}
              </button>
            ))}
          </div>
          {form.disease==='أخرى' && (
            <input className="input mt-2" placeholder="اكتب اسم المرض..." value={form.disease_other} onChange={e=>set('disease_other',e.target.value)} required />
          )}
        </div>

        <div>
          <label className="label">تاريخ العزل</label>
          <input type="date" className="input" value={form.start_date} max={today} onChange={e=>set('start_date',e.target.value)} />
        </div>

        <div>
          <label className="label">العلاج / الدواء</label>
          <input className="input" placeholder="اسم الدواء أو طريقة العلاج..." value={form.treatment} onChange={e=>set('treatment',e.target.value)} />
        </div>

        <div>
          <label className="label">المدة المتوقعة للعلاج</label>
          <input className="input" placeholder="3 أيام، أسبوع، حتى التعافي..." value={form.duration_text} onChange={e=>set('duration_text',e.target.value)} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving?'⏳ جاري...':'💾 حفظ حالة العزل'}</button>
          <button type="button" onClick={()=>router.back()} className="btn-secondary px-5">إلغاء</button>
        </div>
      </form>
    </div>
  )
}
