'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DeathsPage() {
  const [deaths, setDeaths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/deaths').then(r=>r.json()).then(j=>{setDeaths(j.data||[]);setLoading(false)})
  }, [])

  const byCategory: Record<string,number> = {}
  deaths.forEach(d => { byCategory[d.category] = (byCategory[d.category]||0)+1 })

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-16"/>)}</div>

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">📋 النفوق</h1>
        <Link href="/deaths/new" className="btn-primary text-sm">＋ تسجيل</Link>
      </div>

      {deaths.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            {l:'الإجمالي', v:deaths.length, icon:'📋'},
            {l:'هذا الشهر', v:deaths.filter(d=>{
              const dm=new Date(d.death_date).getMonth()
              return dm===new Date().getMonth()
            }).length, icon:'📅'},
            {l:'فئات', v:Object.keys(byCategory).length, icon:'📊'},
          ].map(s=>(
            <div key={s.l} className="stat-card text-center">
              <span className="text-xl">{s.icon}</span>
              <div className="stat-value text-xl text-red-500">{s.v}</div>
              <div className="stat-label text-xs">{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {deaths.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">لا توجد سجلات نفوق</p>
          <p className="text-xs text-gray-400 mt-1">يُنقص تلقائياً من إجمالي القطيع</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deaths.map((d:any) => (
            <div key={d.id} className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📋</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm">{d.animal_id}</span>
                  {d.color && <span className="text-xs text-gray-400">{d.color}</span>}
                  <span className="badge badge-gray text-xs">{d.category}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {d.death_date}
                  {d.reason && ` · ${d.reason}`}
                </p>
                {d.mom_id && <p className="text-xs text-gray-400">الأم: {d.mom_id}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
