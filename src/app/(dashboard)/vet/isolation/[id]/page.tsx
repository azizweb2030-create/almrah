'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

export default function VetIsolationDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [c, setC] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logForm, setLogForm] = useState({ date: new Date().toISOString().split('T')[0], note: '', temp: '' })
  const [showLog, setShowLog] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/vet/isolation').then(r => r.json()).then(j => {
      setC((j.data || []).find((x: any) => x.id === id))
      setLoading(false)
    })
  }, [id])

  async function closeCase() {
    setSaving(true)
    await fetch(`/api/vet/isolation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false, end_date: new Date().toISOString().split('T')[0] })
    })
    setC((p: any) => ({ ...p, active: false }))
    setSaving(false)
    toast.success('✅ تم إغلاق الحالة')
  }

  async function addLog() {
    if (!logForm.note.trim()) { toast.error('اكتب ملاحظة'); return }
    setSaving(true)
    // vet_isolation uses extended_log (JSONB array)
    const existing = c.extended_log || []
    const newLog = [...existing, { date: logForm.date, note: logForm.note, temp: logForm.temp || null }]
    await fetch(`/api/vet/isolation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extended_log: newLog })
    })
    setC((p: any) => ({ ...p, extended_log: newLog }))
    setLogForm({ date: new Date().toISOString().split('T')[0], note: '', temp: '' })
    setShowLog(false)
    setSaving(false)
    toast.success('✅ تمت إضافة المتابعة')
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20"/>)}</div>
  if (!c) return <div className="text-center py-20"><p className="text-gray-500">غير موجود</p><button onClick={() => router.push('/vet')} className="btn-primary mt-4">العودة</button></div>

  const logs = c.extended_log || []

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="page-header">
        <button onClick={() => router.push('/vet')} className="text-gray-500 text-sm">→ رجوع</button>
        <h1 className="page-title">🩺 {c.animal_id}</h1>
        <div/>
      </div>

      <div className={cn('card space-y-3', !c.active ? 'opacity-75' : '')}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-xl">{c.animal_id}</span>
          <span className={cn('badge text-xs', c.active ? 'badge-red' : 'badge-green')}>{c.active ? 'نشط' : 'مُغلق'}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { l: 'المرض / الحالة', v: c.status || '—' },
            { l: 'تاريخ البداية', v: c.start_date },
            { l: 'الدواء', v: c.medicine || '—' },
            { l: 'ملاحظات', v: c.usage_notes || '—' },
          ].map(item => (
            <div key={item.l} className="bg-beige-primary rounded-xl p-3">
              <p className="text-xs text-gray-500">{item.l}</p>
              <p className="font-semibold text-sm truncate">{item.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">📋 المتابعة اليومية ({logs.length})</h2>
          {c.active && (
            <button onClick={() => setShowLog(p => !p)} className="btn-primary text-xs px-3 py-1.5">
              {showLog ? 'إلغاء' : '＋ متابعة'}
            </button>
          )}
        </div>
        {showLog && (
          <div className="bg-beige-primary rounded-2xl p-3 mb-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label text-xs">التاريخ</label>
                <input type="date" className="input text-sm" value={logForm.date}
                  onChange={e => setLogForm(p => ({ ...p, date: e.target.value }))}/>
              </div>
              <div>
                <label className="label text-xs">الحرارة</label>
                <input type="number" step="0.1" className="input text-sm" placeholder="38.5"
                  value={logForm.temp} onChange={e => setLogForm(p => ({ ...p, temp: e.target.value }))}/>
              </div>
            </div>
            <div>
              <label className="label text-xs">الملاحظة *</label>
              <textarea className="input text-sm resize-none" rows={2} value={logForm.note}
                onChange={e => setLogForm(p => ({ ...p, note: e.target.value }))} placeholder="الحالة اليوم، العلاج..."/>
            </div>
            <button onClick={addLog} disabled={saving} className="btn-primary w-full text-sm">
              {saving ? '⏳...' : '💾 حفظ'}
            </button>
          </div>
        )}
        {logs.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">لا توجد متابعات بعد</p>
        ) : (
          <div className="space-y-2">
            {[...logs].reverse().map((log: any, i: number) => (
              <div key={i} className="flex gap-3 p-3 bg-beige-primary rounded-xl">
                <p className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{log.date}</p>
                <div className="flex-1">
                  <p className="text-sm">{log.note}</p>
                  {log.temp && <p className="text-xs text-gray-500 mt-0.5">🌡️ {log.temp}°م</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {c.active && (
        <div className="card">
          <button onClick={closeCase} disabled={saving}
            className="w-full py-2.5 text-sm font-medium text-green-primary hover:bg-green-subtle rounded-xl transition-colors">
            ✅ إغلاق الحالة (تعافى)
          </button>
        </div>
      )}
    </div>
  )
}
