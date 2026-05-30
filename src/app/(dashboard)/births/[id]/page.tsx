'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

export default function BirthDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [birth, setBirth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const [breeding, setBreeding] = useState(false)

  useEffect(() => {
    fetch(`/api/births/${id}`).then(r => r.json()).then(j => {
      setBirth(j.data); setLoading(false)
    })
  }, [id])

  async function toggleBreeding() {
    setBreeding(true)
    const newVal = !birth.in_breeding
    const breedingDate = newVal ? new Date().toISOString().split('T')[0] : null
    const res = await fetch(`/api/births/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ in_breeding: newVal, breeding_date: breedingDate })
    })
    const j = await res.json()
    if (j.error) { toast.error(j.error) }
    else { setBirth((p: any) => ({ ...p, in_breeding: newVal, breeding_date: breedingDate })); toast.success(newVal ? '✅ تم تفعيل شبك التلقيح' : 'تم إلغاء الشبك') }
    setBreeding(false)
  }

  async function handleDelete() {
    await fetch(`/api/births/${id}`, { method: 'DELETE' })
    toast.success('تم الحذف'); router.push('/births')
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-20"/>)}</div>
  if (!birth) return <div className="text-center py-20"><p className="text-gray-500">غير موجود</p><button onClick={()=>router.push('/births')} className="btn-primary mt-4">العودة</button></div>

  const alive = (birth.babies || []).filter((b: any) => b.health !== 'نفوق').length
  const expectedBirth = birth.in_breeding && birth.breeding_date
    ? (() => { const d = new Date(birth.breeding_date); d.setDate(d.getDate() + 150); return d.toISOString().split('T')[0] })()
    : null
  const daysLeft = expectedBirth
    ? Math.ceil((new Date(expectedBirth).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="page-header">
        <button onClick={() => router.push('/births')} className="text-gray-500 text-sm">→ رجوع</button>
        <h1 className="page-title">🐑 الأم {birth.mom_id}</h1>
        <div/>
      </div>

      {/* بيانات الأم */}
      <div className="card space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { l: 'رقم الأم', v: birth.mom_id },
            { l: 'اللون', v: birth.mom_color || '—' },
            { l: 'تاريخ الولادة', v: birth.birth_date },
            { l: 'عدد المواليد', v: `${alive} حي` },
          ].map(item => (
            <div key={item.l} className="bg-beige-primary rounded-xl p-3">
              <p className="text-xs text-gray-500">{item.l}</p>
              <p className="font-semibold text-sm">{item.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* شبك التلقيح */}
      <div className={cn('card', birth.in_breeding ? 'border-gold-primary/50 bg-gold-subtle/10' : '')}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">🤰 شبك التلقيح</h2>
          <button onClick={toggleBreeding} disabled={breeding}
            className={cn('px-3 py-1.5 rounded-xl text-sm font-medium transition-colors', birth.in_breeding ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'btn-primary')}>
            {breeding ? '...' : birth.in_breeding ? 'إلغاء الشبك' : '🐏 تفعيل الشبك'}
          </button>
        </div>
        {birth.in_breeding && expectedBirth && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>تاريخ الشبك: {birth.breeding_date}</span>
              <span className={daysLeft && daysLeft < 0 ? 'text-red-600 font-bold' : 'text-green-primary font-bold'}>
                {daysLeft !== null && daysLeft < 0 ? `متأخرة ${Math.abs(daysLeft)} يوم` : `${daysLeft} يوم متبقٍ`}
              </span>
            </div>
            <div className="h-2 bg-beige-border rounded-full overflow-hidden">
              <div className="h-full bg-gold-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, ((150 - (daysLeft || 0)) / 150) * 100))}%` }} />
            </div>
            <p className="text-xs text-gray-500 text-center">الولادة المتوقعة: {expectedBirth}</p>
          </div>
        )}
      </div>

      {/* المواليد */}
      {(birth.babies || []).length > 0 && (
        <div className="card">
          <h2 className="font-bold mb-3">🍼 المواليد ({(birth.babies || []).length})</h2>
          <div className="space-y-2">
            {(birth.babies || []).map((baby: any, i: number) => (
              <div key={i} className={cn('flex items-center gap-3 p-3 rounded-xl', baby.health === 'نفوق' ? 'bg-gray-100 opacity-60' : 'bg-beige-primary')}>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold', baby.gender === 'ذكر' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700')}>
                  {baby.gender === 'ذكر' ? '♂' : '♀'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{baby.baby_id}</p>
                  <p className="text-xs text-gray-500">{baby.gender} · {baby.color || '—'} · {baby.health}</p>
                </div>
                {baby.stage && <span className="badge badge-green text-xs">{baby.stage}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* حذف */}
      <div className="card">
        {!confirm ? (
          <button onClick={() => setConfirm(true)} className="w-full text-red-500 text-sm py-1 hover:text-red-700">🗑 حذف هذا السجل</button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-center text-red-600 font-medium">هل أنت متأكد من الحذف؟</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="btn-danger flex-1 text-sm">تأكيد</button>
              <button onClick={() => setConfirm(false)} className="btn-secondary flex-1 text-sm">إلغاء</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
