'use client'
import { useState, useEffect } from 'react'
export default function AdminPage() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch('/api/admin/stats').then(r=>r.json()).then(j=>setData(j.data)) }, [])
  const PLAN_AR: Record<string,string> = {monthly:'شهري',lifetime:'دائم',trial:'تجريبي'}
  const S_BADGE: Record<string,string> = {active:'bg-green-100 text-green-700',pending:'bg-amber-100 text-amber-700',expired:'bg-red-100 text-red-700',trial:'bg-blue-100 text-blue-700'}
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">📊 لوحة التحكم</h1>
      <div className="grid grid-cols-3 gap-4">
        {[{l:'المستخدمون',v:data?.totalUsers||0,icon:'👥',c:'text-blue-600'},{l:'نشطون',v:data?.activeSubscriptions||0,icon:'✅',c:'text-green-600'},{l:'تذاكر مفتوحة',v:data?.openTickets||0,icon:'🎫',c:'text-amber-600'}].map(s=>(
          <div key={s.l} className="bg-white rounded-2xl border border-gray-200 p-4"><div className="text-2xl">{s.icon}</div><div className={`text-3xl font-black ${s.c}`}>{s.v}</div><div className="text-xs text-gray-500">{s.l}</div></div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b"><h2 className="font-bold">آخر المستخدمين</h2></div>
        {(data?.recentUsers||[]).map((u:any)=>(
          <div key={u.id} className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <div><p className="font-medium text-sm">{u.full_name||'—'}</p><p className="text-xs text-gray-400">{u.email}</p></div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${S_BADGE[u.subscription_status]||'bg-gray-100 text-gray-600'}`}>{PLAN_AR[u.subscription_plan]||u.subscription_plan}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
