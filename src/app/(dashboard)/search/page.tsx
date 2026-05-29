'use client'
import { useState } from 'react'
import { formatShortDate } from '@/lib/utils/dates'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any>(null)

  async function search(val:string) {
    setQ(val)
    if (val.length < 2) { setResults(null); return }
    const r = await fetch(`/api/search?q=${encodeURIComponent(val)}`).then(r=>r.json())
    setResults(r.data)
  }

  const total = results ? Object.values(results).reduce((s:any,a:any)=>s+a.length,0) : 0

  return (
    <div className="space-y-4">
      <h1 className="page-title">🔍 البحث</h1>
      <input className="input" placeholder="ابحث برقم الحيوان..." value={q} onChange={e=>search(e.target.value)} autoFocus/>
      {results && total === 0 && <div className="card text-center py-10 text-gray-400">لا توجد نتائج</div>}
      {results && total > 0 && (
        <div className="space-y-4">
          {results.births?.length>0 && <div><p className="text-xs text-gray-400 mb-2 font-bold">🐑 ولادات</p><div className="space-y-1">{results.births.map((b:any)=><div key={b.id} className="card text-sm flex justify-between"><span>الأم: {b.mom_id}</span><span>{formatShortDate(b.birth_date)}</span></div>)}</div></div>}
          {results.babies?.length>0 && <div><p className="text-xs text-gray-400 mb-2 font-bold">🍼 مواليد</p><div className="space-y-1">{results.babies.map((b:any)=><div key={b.id} className="card text-sm">{b.animal_id} — {b.stage}</div>)}</div></div>}
          {results.deaths?.length>0 && <div><p className="text-xs text-gray-400 mb-2 font-bold">📋 نفوق</p><div className="space-y-1">{results.deaths.map((d:any)=><div key={d.id} className="card text-sm">{d.animal_id} — {d.cause}</div>)}</div></div>}
        </div>
      )}
    </div>
  )
}
