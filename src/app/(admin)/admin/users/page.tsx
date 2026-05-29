'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  useEffect(() => { fetch(`/api/admin/users${search?`?q=${search}`:''}`).then(r=>r.json()).then(j=>setUsers(j.data||[])) }, [search])
  async function update(userId:string, updates:any) {
    const res = await fetch('/api/admin/users',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,updates})})
    const j = await res.json(); if(j.error){toast.error(j.error);return}
    setUsers(p=>p.map(u=>u.id===userId?{...u,...updates}:u)); toast.success('تم')
  }
  const PLAN_AR: Record<string,string> = {monthly:'شهري',lifetime:'دائم',trial:'تجريبي'}
  if (selected) return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3"><button onClick={()=>setSelected(null)} className="text-gray-500 text-sm">→ رجوع</button><h1 className="text-xl font-black">إدارة المستخدم</h1></div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <p className="font-bold">{selected.full_name||'—'}</p><p className="text-sm text-gray-500">{selected.email}</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs mb-1">الخطة</label><select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50" defaultValue={selected.subscription_plan} onChange={e=>update(selected.id,{subscription_plan:e.target.value})}>{['trial','monthly','lifetime'].map(p=><option key={p} value={p}>{PLAN_AR[p]}</option>)}</select></div>
          <div><label className="block text-xs mb-1">الحالة</label><select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50" defaultValue={selected.subscription_status} onChange={e=>update(selected.id,{subscription_status:e.target.value})}>{['active','pending','expired'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          <div><label className="block text-xs mb-1">الدور</label><select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50" defaultValue={selected.role} onChange={e=>update(selected.id,{role:e.target.value})}>{['trial','subscriber','admin'].map(r=><option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className="block text-xs mb-1">حد التوكنات</label><input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50" defaultValue={selected.ai_tokens_limit} onBlur={e=>update(selected.id,{ai_tokens_limit:parseInt(e.target.value)})}/></div>
        </div>
      </div>
    </div>
  )
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-gray-900">👥 المستخدمون ({users.length})</h1>
      <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm" placeholder="بحث..." value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-50">
        {users.map(u=>(
          <button key={u.id} onClick={()=>setSelected(u)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-right">
            <div><p className="font-medium text-sm">{u.full_name||'—'}</p><p className="text-xs text-gray-400">{u.email}</p></div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{PLAN_AR[u.subscription_plan]||u.subscription_plan}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
