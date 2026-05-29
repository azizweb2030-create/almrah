'use client'
import { useState, useEffect } from 'react'

export default function ReportsPage() {
  const [flock, setFlock] = useState<any>(null)
  const [births, setBirths] = useState<any[]>([])
  const [deaths, setDeaths] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/flock').then(r=>r.json()).then(j=>setFlock(j.data))
    fetch('/api/births').then(r=>r.json()).then(j=>setBirths(j.data||[]))
    fetch('/api/deaths').then(r=>r.json()).then(j=>setDeaths(j.data||[]))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="page-title">📈 التقارير</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {l:'إجمالي القطيع',v:flock?.total_count||0,icon:'🐑'},
          {l:'الولادات',v:births.length,icon:'🍼'},
          {l:'إجمالي المواليد',v:births.reduce((s:number,b:any)=>s+(b.birth_count||1),0),icon:'👶'},
          {l:'النفوق',v:deaths.length,icon:'📋'},
        ].map(k=>(
          <div key={k.l} className="stat-card">
            <span className="text-2xl">{k.icon}</span>
            <div className="stat-value">{k.v}</div>
            <div className="stat-label">{k.l}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-bold mb-3">🐑 آخر الولادات</h2>
        <div className="space-y-2">
          {births.slice(0,10).map((b:any) => (
            <div key={b.id} className="flex items-center justify-between p-3 bg-beige-primary rounded-xl text-sm">
              <span>الأم: {b.mom_id}</span>
              <span className="badge-green text-xs">{b.birth_count} {b.birth_type}</span>
            </div>
          ))}
          {births.length===0 && <p className="text-center text-gray-400 py-4">لا توجد بيانات</p>}
        </div>
      </div>
    </div>
  )
}
