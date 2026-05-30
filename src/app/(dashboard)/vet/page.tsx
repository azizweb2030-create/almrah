'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export default function VetPage() {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/vet/isolation').then(r=>r.json()).then(j=>{setCases(j.data||[]);setLoading(false)})
  }, [])

  const active = cases.filter(c => c.active)
  const inactive = cases.filter(c => !c.active)

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-20"/>)}</div>

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">🩺 البيطرة</h1>
        <Link href="/vet/isolation/new" className="btn-primary text-sm">＋ عزل</Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card text-center"><div className="text-2xl font-black text-red-600">{active.length}</div><div className="stat-label">نشطة</div></div>
        <div className="stat-card text-center"><div className="text-2xl font-black text-gray-500">{inactive.length}</div><div className="stat-label">مُغلقة</div></div>
      </div>
      {cases.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🩺</div>
          <p className="text-gray-500">لا توجد حالات</p>
          <Link href="/vet/isolation/new" className="btn-primary mt-4 inline-block">إضافة حالة</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c:any) => (
            <Link key={c.id} href={`/vet/isolation/${c.id}`}>
              <div className={cn('card-hover border', c.severity==='حرجة'?'border-red-300 bg-red-50/30':c.severity==='متوسطة'?'border-orange-200':'')}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{c.animal_id}</span>
                      {c.severity && <span className={cn('badge text-xs', c.severity==='حرجة'?'badge-red':'badge-gray')}>{c.severity}</span>}
                      <span className={cn('badge text-xs', c.active?'badge-red':'badge-green')}>{c.active?'نشط':'مُغلق'}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.disease}{c.disease_other&&` — ${c.disease_other}`}</p>
                    <p className="text-xs text-gray-400">{c.start_date}</p>
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
