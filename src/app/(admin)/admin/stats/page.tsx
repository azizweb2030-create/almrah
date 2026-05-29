'use client'
import { useState, useEffect } from 'react'
export default function AdminStatsPage() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch('/api/admin/stats').then(r=>r.json()).then(j=>setData(j.data)) }, [])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">📈 الإحصائيات</h1>
      <div className="grid grid-cols-2 gap-4">
        {[{l:'المستخدمون',v:data?.totalUsers||0},{l:'نشطون',v:data?.activeSubscriptions||0},{l:'تذاكر مفتوحة',v:data?.openTickets||0},{l:'توكنات AI',v:(data?.totalTokensUsed||0).toLocaleString()}].map(s=>(
          <div key={s.l} className="bg-white rounded-2xl border border-gray-200 p-4"><div className="text-2xl font-black text-gray-900">{s.v}</div><div className="text-xs text-gray-500">{s.l}</div></div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b"><h2 className="font-bold">أكثر استخداماً للـ AI</h2></div>
        {(data?.recentUsers||[]).map((u:any,i:number)=>(
          <div key={i} className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <div><p className="font-medium text-sm">{u.full_name||'—'}</p><p className="text-xs text-gray-400">{u.email}</p></div>
            <p className="text-sm font-bold">{(u.ai_tokens_used||0).toLocaleString()} توكن</p>
          </div>
        ))}
      </div>
    </div>
  )
}
