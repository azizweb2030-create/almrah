'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

const COLORS = ['أبيض','أسود','بني','رمادي','أحمر','مختلط']

export default function NewBirthPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [momId, setMomId] = useState('')
  const [momColor, setMomColor] = useState('')
  const [birthDate, setBirthDate] = useState(today)
  const [inBreeding, setInBreeding] = useState(false)
  const [babies, setBabies] = useState([{ baby_id: '', color: '', gender: 'أنثى', health: 'سليم' }])
  const [saving, setSaving] = useState(false)

  function addBaby() { setBabies(p => [...p, { baby_id: '', color: '', gender: 'أنثى', health: 'سليم' }]) }
  function removeBaby(i: number) { if (babies.length > 1) setBabies(p => p.filter((_, idx) => idx !== i)) }
  function updateBaby(i: number, k: string, v: string) { setBabies(p => p.map((b, idx) => idx === i ? { ...b, [k]: v } : b)) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!momId.trim()) { toast.error('رقم الأم مطلوب'); return }
    if (babies.some(b => !b.baby_id.trim())) { toast.error('رقم المولود مطلوب'); return }
    setSaving(true)
    const breedingDate = inBreeding
      ? (() => { const d = new Date(birthDate); d.setDate(d.getDate() + 15); return d.toISOString().split('T')[0] })()
      : null
    const res = await fetch('/api/births', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mom_id: momId, mom_color: momColor, birth_date: birthDate, babies, in_breeding: inBreeding, breeding_date: breedingDate })
    })
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    toast.success('✅ تم حفظ سجل الولادة')
    router.push('/births')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="page-header mb-6">
        <button onClick={() => router.back()} className="text-gray-500 text-sm">→ رجوع</button>
        <h1 className="page-title">🐑 ولادة جديدة</h1>
        <div/>
      </div>
      <form onSubmit={handleSave} className="card space-y-5">
        <div>
          <label className="label">رقم الأم *</label>
          <input className="input" placeholder="1001" value={momId} onChange={e => setMomId(e.target.value)} required />
        </div>
        <div>
          <label className="label">لون الأم</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setMomColor(c)}
                className={cn('px-3 py-1.5 rounded-xl text-sm border', momColor === c ? 'bg-green-primary text-white' : 'bg-white border-beige-border')}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">تاريخ الولادة *</label>
          <input type="date" className="input" value={birthDate} max={today} onChange={e => setBirthDate(e.target.value)} required />
        </div>
        {/* شبك التلقيح */}
        <div className={cn('border rounded-2xl p-4 transition-colors', inBreeding ? 'border-gold-primary/50 bg-gold-subtle/10' : 'border-beige-border bg-beige-primary')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">🐏 شبك التلقيح</p>
              <p className="text-xs text-gray-500">يفعّل عداد الـ 150 يوم للولادة القادمة</p>
            </div>
            <button type="button" onClick={() => setInBreeding(p => !p)}
              className={cn('w-12 h-6 rounded-full transition-colors relative', inBreeding ? 'bg-gold-primary' : 'bg-gray-300')}>
              <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', inBreeding ? 'right-0.5' : 'left-0.5')} />
            </button>
          </div>
          {inBreeding && (
            <p className="text-xs text-gold-dark mt-2">
              ✅ سيتم تفعيل الشبك بعد 15 يوم من الولادة ({
                (() => { const d = new Date(birthDate); d.setDate(d.getDate() + 15); return d.toISOString().split('T')[0] })()
              })
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">المواليد ({babies.length})</label>
            <button type="button" onClick={addBaby} className="text-xs text-green-primary hover:underline">+ إضافة</button>
          </div>
          <div className="space-y-3">
            {babies.map((baby, i) => (
              <div key={i} className="bg-beige-primary border border-beige-border rounded-2xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500">المولود {i + 1}</p>
                  {babies.length > 1 && <button type="button" onClick={() => removeBaby(i)} className="text-xs text-red-400">✕ حذف</button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">رقم المولود *</label>
                    <input className="input text-sm" placeholder="2001" value={baby.baby_id} onChange={e => updateBaby(i, 'baby_id', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label text-xs">الحالة</label>
                    <select className="input text-sm" value={baby.health} onChange={e => updateBaby(i, 'health', e.target.value)}>
                      {['سليم', 'مريض', 'ضعيف', 'نفوق'].map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label text-xs">اللون</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => updateBaby(i, 'color', c)}
                        className={cn('px-2.5 py-1 rounded-lg text-xs border', baby.color === c ? 'bg-green-primary text-white' : 'bg-white border-beige-border')}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {['ذكر', 'أنثى'].map(g => (
                    <button key={g} type="button" onClick={() => updateBaby(i, 'gender', g)}
                      className={cn('flex-1 py-2 rounded-xl text-sm font-medium border', baby.gender === g ? 'bg-green-primary text-white' : 'bg-white border-beige-border')}>
                      {g === 'ذكر' ? '🐏 ذكر' : '🐑 أنثى'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? '⏳ جاري...' : '💾 حفظ'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary px-5">إلغاء</button>
        </div>
      </form>
    </div>
  )
}
