'use client'
import { useState, useEffect } from 'react'
import { formatArabicDate } from '@/lib/utils/dates'
import toast from 'react-hot-toast'
export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [reply, setReply] = useState('')
  const [newStatus, setNewStatus] = useState('')
  useEffect(() => { fetch('/api/admin/tickets').then(r=>r.json()).then(j=>setTickets(j.data||[])) }, [])
  async function update() {
    if (!selected) return
    await fetch('/api/admin/tickets',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticketId:selected.id,status:newStatus||selected.status,reply:reply||undefined})})
    setTickets(p=>p.map(t=>t.id===selected.id?{...t,status:newStatus||t.status}:t)); setReply(''); toast.success('تم')
  }
  const S: Record<string,string> = {'مفتوح':'badge-green','قيد_المعالجة':'badge-gold','محلول':'badge-gray','مغلق':'badge-gray'}
  if (selected) return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3"><button onClick={()=>setSelected(null)} className="text-gray-500 text-sm">→ رجوع</button><h1 className="text-lg font-black">{selected.ticket_number}</h1></div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <p className="font-bold">{selected.subject}</p>
        <div className="bg-gray-50 rounded-xl p-3 text-sm">{selected.message}</div>
        <p className="text-xs text-gray-400">{selected.profiles?.full_name} · {formatArabicDate(selected.created_at)}</p>
        <div><label className="block text-xs mb-1">الحالة</label><select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50" defaultValue={selected.status} onChange={e=>setNewStatus(e.target.value)}>{['مفتوح','قيد_المعالجة','محلول','مغلق'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        <div><label className="block text-xs mb-1">الرد</label><textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 resize-none" rows={3} value={reply} onChange={e=>setReply(e.target.value)}/></div>
        <button onClick={update} className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-medium">💾 حفظ</button>
      </div>
    </div>
  )
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-gray-900">🎫 التذاكر ({tickets.length})</h1>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-50">
        {tickets.map(t=>(
          <button key={t.id} onClick={()=>setSelected(t)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-right">
            <div><p className="font-medium text-sm">{t.subject}</p><p className="text-xs text-gray-400">{t.profiles?.full_name}</p></div>
            <span className={`badge text-xs ${S[t.status]||'badge-gray'}`}>{t.status}</span>
          </button>
        ))}
        {tickets.length===0 && <p className="text-center text-gray-400 py-10">لا توجد تذاكر</p>}
      </div>
    </div>
  )
}
