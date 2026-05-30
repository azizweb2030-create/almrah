'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DeathsPage() {
  const [deaths, setDeaths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/deaths').then(r=>r.json()).then(j=>{setDeaths(j.data||[]);setLoading(false)})
  }, [])

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-16"/>)}</div>

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">📋 النفوق</h1>
        <Link href="/deaths/new" className="btn-primary text-sm">＋ جديد</Link>
      </div>
      {deaths.length===0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">لا توجد سجلات نفوق</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deaths.map((d:any) => (
            <div key={d.id} className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">📋</div>
              <div className="flex-1">
                <p className="font-bold text-sm">{d.animal_id} {d.color&&`· ${d.color}`}</p>
                <p className="text-xs text-gray-500">{d.death_date} · {d.category} {d.reason&&`· ${d.reason}`}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
