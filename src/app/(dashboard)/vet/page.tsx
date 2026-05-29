'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatShortDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

export default function VetPage() {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/vet/isolation').then(r=>r.json()).then(j=>{setCases(j.data||[]);setLoading(false)}) }, [])

  const active = cases.filter(c => c.status==='معزول'||c.status==='تحت المتابعة')
  const critical = cases.filter(c => (c.severity==='طارئ'||c.severity==='حرج') && c.status!=='تعافى')

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-20"/>)}</div>

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">🩺 البيطرة</h1>
        <Link href="/vet/isolation/new" className="btn-primary text-sm">＋ عزل</Link>
      </div>
      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div><p className="font-bold text-red-700 text-sm">{critical.length} حالة حرجة</p><p className="text-xs text-red-500">{critical.map((c:any)=>c.animal_id).join(' · ')}</p></div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {[{l:'نشطة',v:active.length,c:'text-red-600'},{l:'حرجة',v:critical.length,c:'text-orange-600'},{l:'الإجمالي',v:cases.length,c:'text-gray-700'}].map(s=>(
          <div key={s.l} className="stat-card text-center"><div className={`text-2xl font-black ${s.c}`}>{s.v}</div><div className="stat-label">{s.l}</div></div>
        ))}
      </div>
      {cases.length === 0 ? (
        <div className="card text-center py-16"><div className="text-5xl mb-3">🩺</div><p className="text-gray-500">لا توجد حالات</p><Link href="/vet/isolation/new" className="btn-primary mt-4 inline-block">إضافة حالة</Link></div>
      ) : (
        <div className="space-y-3">
          {cases.map((c:any) => (
            <Link key={c.id} href={`/vet/isolation/${c.id}`}>
              <div className={cn('card-hover border', c.severity==='طارئ'?'border-red-300 bg-red-50/30':c.severity==='حرج'?'border-orange-200':'')}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{c.animal_id}</span>
                      <span className={cn('badge text-xs', c.severity==='طارئ'?'badge-red':'badge-gray')}>{c.severity}</span>
                      <span className="badge badge-gray text-xs">{c.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.reason}</p>
                    <p className="text-xs text-gray-400">{formatShortDate(c.start_date)}</p>
                  </div>
                  <span className="text-gray-400">‹</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
