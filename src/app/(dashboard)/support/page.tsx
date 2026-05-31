'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

const STATUS_STYLE: Record<string,string> = {
  'مفتوح':'badge-green',
  'قيد_المعالجة':'badge-gold',
  'محلول':'badge-gray',
  'مغلق':'badge-gray'
}
const PRIORITIES = ['منخفض','متوسط','عالي','عاجل']

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ subject:'', message:'', priority:'متوسط' })
  const [replyText, setReplyText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/support/tickets').then(r=>r.json()).then(j=>setTickets(j.data||[]))
  }, [])

  async function openTicket(t: any) {
    setSelected(t)
    const r = await fetch(`/api/support/tickets/${t.id}/replies`)
    const j = await r.json()
    setReplies(j.data||[])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject.trim()||!form.message.trim()) { toast.error('يرجى ملء الحقول'); return }
    setSaving(true)
    const res = await fetch('/api/support/tickets', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form)
    })
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    setTickets(p=>[j.data,...p]); setShowNew(false); setForm({subject:'',message:'',priority:'متوسط'})
    setSaving(false); toast.success('✅ تم إرسال التذكرة')
  }

  async function sendReply() {
    if (!replyText.trim() || !selected) return
    setSaving(true)
    const res = await fetch(`/api/support/tickets/${selected.id}/replies`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message: replyText })
    })
    const j = await res.json()
    setReplies(p=>[...p, j.data]); setReplyText(''); setSaving(false)
  }

  // صفحة التذكرة المفتوحة
  if (selected) return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={()=>{setSelected(null);setReplies([])}} className="text-gray-500 text-sm">→ رجوع</button>
        <h1 className="font-bold text-lg flex-1 truncate">{selected.subject}</h1>
        <span className={cn('badge text-xs', STATUS_STYLE[selected.status]||'badge-gray')}>{selected.status}</span>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">{selected.ticket_number}</span>
          <span className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleDateString('ar-SA')}</span>
        </div>
        <p className="text-sm text-gray-700 bg-beige-primary rounded-xl p-3">{selected.message}</p>
      </div>

      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((r:any) => (
            <div key={r.id} className={cn('flex gap-2', r.is_admin?'':'flex-row-reverse')}>
              <div className="w-7 h-7 rounded-full bg-beige-dark flex items-center justify-center text-xs flex-shrink-0">
                {r.is_admin?'🛡️':'👤'}
              </div>
              <div className={cn('flex-1 max-w-xs px-3 py-2 rounded-2xl text-sm', r.is_admin?'bg-green-subtle text-green-primary':'bg-beige-primary text-gray-700')}>
                {r.message}
                <p className="text-[10px] opacity-60 mt-1">{new Date(r.created_at).toLocaleTimeString('ar-SA', {hour:'2-digit',minute:'2-digit'})}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected.status !== 'مغلق' && selected.status !== 'محلول' && (
        <div className="card">
          <textarea className="input resize-none mb-3" rows={3}
            placeholder="اكتب ردك..." value={replyText} onChange={e=>setReplyText(e.target.value)} />
          <button onClick={sendReply} disabled={saving||!replyText.trim()} className="btn-primary w-full text-sm">
            {saving?'⏳...':'📤 إرسال'}
          </button>
        </div>
      )}
    </div>
  )

  // قائمة التذاكر
  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">🎫 الدعم الفني</h1>
        <button onClick={()=>setShowNew(p=>!p)} className="btn-primary text-sm">
          {showNew?'إلغاء':'＋ تذكرة جديدة'}
        </button>
      </div>

      {showNew && (
        <form onSubmit={submit} className="card space-y-4">
          <h2 className="font-bold text-sm">تذكرة دعم جديدة</h2>
          <div>
            <label className="label">الموضوع *</label>
            <input className="input" placeholder="وصف مختصر للمشكلة..." value={form.subject}
              onChange={e=>setForm(p=>({...p,subject:e.target.value}))} required />
          </div>
          <div>
            <label className="label">الأولوية</label>
            <div className="flex gap-2 flex-wrap">
              {PRIORITIES.map(p=>(
                <button key={p} type="button" onClick={()=>setForm(prev=>({...prev,priority:p}))}
                  className={cn('px-3 py-1.5 rounded-xl text-xs border transition-colors',
                    form.priority===p?'bg-green-primary text-white':'bg-white border-beige-border')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">التفاصيل *</label>
            <textarea className="input resize-none" rows={4}
              placeholder="اشرح المشكلة بالتفصيل..." value={form.message}
              onChange={e=>setForm(p=>({...p,message:e.target.value}))} required />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving?'⏳...':'📤 إرسال'}</button>
            <button type="button" onClick={()=>setShowNew(false)} className="btn-secondary px-5">إلغاء</button>
          </div>
        </form>
      )}

      {tickets.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🎫</div>
          <p className="text-gray-500">لا توجد تذاكر</p>
          <p className="text-xs text-gray-400 mt-1">فريق الدعم هنا لمساعدتك</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t:any) => (
            <button key={t.id} onClick={()=>openTicket(t)} className="w-full card-hover text-right">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{t.subject}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400">{t.ticket_number}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('ar-SA')}</span>
                    {t.priority !== 'متوسط' && <span className="text-xs text-amber-600">· {t.priority}</span>}
                  </div>
                </div>
                <span className={cn('badge text-xs flex-shrink-0', STATUS_STYLE[t.status]||'badge-gray')}>{t.status}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
