'use client'
import { useState, useEffect } from 'react'
import { formatArabicDate } from '@/lib/utils/dates'
import toast from 'react-hot-toast'

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({subject:'',message:'',priority:'متوسط'})
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/support/tickets').then(r=>r.json()).then(j=>setTickets(j.data||[])) }, [])

  async function submit(e:React.FormEvent) {
    e.preventDefault()
    if (!form.subject.trim()||!form.message.trim()) { toast.error('يرجى ملء الحقول'); return }
    setSaving(true)
    const res = await fetch('/api/support/tickets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j = await res.json()
    setTickets(p=>[j.data,...p]); setShowNew(false); setSaving(false); toast.success('تم إرسال التذكرة')
  }

  const STATUS_STYLE: Record<string,string> = {'مفتوح':'badge-green','قيد_المعالجة':'badge-gold','محلول':'badge-gray','مغلق':'badge-gray'}

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">🎫 الدعم الفني</h1>
        <button onClick={()=>setShowNew(p=>!p)} className="btn-primary text-sm">{showNew?'إلغاء':'＋ تذكرة'}</button>
      </div>
      {showNew && (
        <form onSubmit={submit} className="card space-y-4">
          <div><label className="label">الموضوع *</label><input className="input" value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} required /></div>
          <div><label className="label">التفاصيل *</label><textarea className="input resize-none" rows={4} value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} required /></div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving?'⏳...':'📤 إرسال'}</button>
            <button type="button" onClick={()=>setShowNew(false)} className="btn-secondary px-5">إلغاء</button>
          </div>
        </form>
      )}
      {tickets.length===0 ? <div className="card text-center py-16"><div className="text-5xl mb-3">🎫</div><p className="text-gray-500">لا توجد تذاكر</p></div> : (
        <div className="space-y-2">
          {tickets.map((t:any)=>(
            <div key={t.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-bold text-sm">{t.subject}</p><p className="text-xs text-gray-400">{t.ticket_number} · {formatArabicDate(t.created_at)}</p></div>
                <span className={`badge text-xs ${STATUS_STYLE[t.status]||'badge-gray'}`}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
