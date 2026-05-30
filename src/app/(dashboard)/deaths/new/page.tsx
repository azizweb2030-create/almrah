'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

// فئات النفوق مطابقة للكود الأصلي
const CATEGORIES = ['بهم','خروف','رخل','أم','فحل','غير محدد']
const COLORS = ['أبيض','أسود','بني','رمادي','أحمر','مختلط']

export default function NewDeathPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ animal_id:'', color:'', category:'غير محدد', reason:'', death_date:today, mom_id:'', mom_color:'' })
  const [saving, setSaving] = useState(false)
  const set = (k:string, v:string) => setForm(p => ({ ...p, [k]:v }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.animal_id.trim()) { toast.error('رقم الحيوان مطلوب'); return }
    setSaving(true)
    const res = await fetch('/api/deaths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    toast.success('✅ تم تسجيل النفوق وخصمه من الإجمالي تلقائياً')
    router.push('/deaths')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="page-header mb-6">
        <button onClick={() => router.back()} className="text-gray-500 text-sm">→ رجوع</button>
        <h1 className="page-title">📋 تسجيل نفوق</h1>
        <div/>
      </div>
      <form onSubmit={save} className="card space-y-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
          ⚠️ سيتم خصم هذا الحيوان من إجمالي القطيع تلقائياً
        </div>
        <div>
          <label className="label">رقم الحيوان *</label>
          <input className="input" placeholder="1001" value={form.animal_id} onChange={e => set('animal_id', e.target.value)} required />
        </div>
        <div>
          <label className="label">الفئة</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => set('category', c)}
                className={cn('px-3 py-1.5 rounded-xl text-sm border transition-colors', form.category===c ? 'bg-red-500 text-white border-red-500' : 'bg-white border-beige-border')}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">اللون</label>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => set('color', c)}
                className={cn('px-2.5 py-1 rounded-lg text-xs border transition-colors', form.color===c ? 'bg-green-primary text-white border-green-primary' : 'bg-white border-beige-border')}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">تاريخ النفوق</label>
          <input type="date" className="input" value={form.death_date} max={today} onChange={e => set('death_date', e.target.value)} />
        </div>
        <div>
          <label className="label">السبب (اختياري)</label>
          <input className="input" placeholder="مرض، حادث، ولادة..." value={form.reason} onChange={e => set('reason', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-xs">رقم الأم (إن وجد)</label>
            <input className="input text-sm" value={form.mom_id} onChange={e => set('mom_id', e.target.value)} placeholder="1001"/>
          </div>
          <div>
            <label className="label text-xs">لون الأم</label>
            <input className="input text-sm" value={form.mom_color} onChange={e => set('mom_color', e.target.value)} placeholder="أبيض..."/>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-danger flex-1" disabled={saving}>{saving ? '⏳...' : '📋 تسجيل النفوق'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary px-5">إلغاء</button>
        </div>
      </form>
    </div>
  )
}
