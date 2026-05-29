'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatShortDate } from '@/lib/utils/dates'

export default function DeathsPage() {
  const [deaths, setDeaths] = useState<any[]>([])
  useEffect(() => { fetch('/api/deaths').then(r=>r.json()).then(j=>setDeaths(j.data||[])) }, [])
  return (
    <div className="space-y-4">
      <div className="page-header"><h1 className="page-title">📋 النفوق</h1><Link href="/deaths/new" className="btn-primary text-sm">＋ جديد</Link></div>
      {deaths.length===0 ? <div className="card text-center py-16"><div className="text-5xl mb-3">📋</div><p className="text-gray-500">لا توجد سجلات</p></div> : (
        <div className="space-y-2">
          {deaths.map((d:any) => (
            <div key={d.id} className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">📋</div>
              <div><p className="font-bold text-sm">{d.animal_id} — {d.animal_type}</p><p className="text-xs text-gray-500">{formatShortDate(d.death_date)} · {d.cause}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
