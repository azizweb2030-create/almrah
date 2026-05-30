'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r=>r.json()).then(j=>{setData(j.data);setLoading(false)})
  }, [])

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-24 rounded-2xl"/>)}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">📊 لوحة الإدارة</h1>
      <div className="grid grid-cols-2 gap-4">
        {[
          {l:'إجمالي المستخدمين', v:data?.totalUsers||0, icon:'👥', href:'/admin/users'},
          {l:'الاشتراكات النشطة', v:data?.activeSubscriptions||0, icon:'💳', href:'/admin/users'},
          {l:'التذاكر المفتوحة', v:data?.openTickets||0, icon:'🎫', href:'/admin/tickets'},
          {l:'توكنات AI المستخدمة', v:data?.totalTokensUsed?.toLocaleString('ar')||0, icon:'🤖', href:'/admin/stats'},
        ].map(s=>(
          <Link key={s.l} href={s.href}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 transition-colors">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.v}</div>
            <div className="text-xs text-gray-400 mt-1">{s.l}</div>
          </Link>
        ))}
      </div>

      {/* آخر المستخدمين */}
      {(data?.recentUsers||[]).length > 0 && (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
          <h2 className="font-bold text-white mb-3">👥 آخر المسجلين</h2>
          <div className="space-y-2">
            {(data.recentUsers||[]).slice(0,5).map((u:any) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {(u.full_name||u.email||'?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.full_name||'—'}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.role==='admin'?'bg-red-500/30 text-red-300':u.subscription_plan==='lifetime'?'bg-yellow-500/30 text-yellow-300':'bg-white/10 text-gray-400'}`}>
                  {u.role==='admin'?'مدير':u.subscription_plan==='lifetime'?'دائم':u.subscription_plan==='monthly'?'شهري':'تجريبي'}
                </span>
              </div>
            ))}
          </div>
          <Link href="/admin/users" className="text-xs text-gray-400 hover:text-white mt-3 block text-center">عرض الكل ←</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          {href:'/admin/users', icon:'👥', label:'المستخدمون'},
          {href:'/admin/tickets', icon:'🎫', label:'التذاكر'},
          {href:'/admin/stats', icon:'📈', label:'الإحصائيات'},
          {href:'/admin/settings', icon:'⚙️', label:'الإعدادات'},
        ].map(a=>(
          <Link key={a.href} href={a.href}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <span className="text-2xl">{a.icon}</span>
            <span className="font-medium text-white">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
