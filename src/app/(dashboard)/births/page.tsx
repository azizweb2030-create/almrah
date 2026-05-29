'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatShortDate, daysUntil, getMatingDate, getExpectedBirthDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

export default function BirthsPage() {
  const [births, setBirths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/births').then(r=>r.json()).then(j=>{setBirths(j.data||[]);setLoading(false)}) }, [])

  const filtered = births.filter(b => !search || b.mom_id.includes(search) || (b.babies||[]).some((baby:any) => baby.animal_id.includes(search)))

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-20"/>)}</div>

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">🐑 الولادات</h1>
        <Link href="/births/new" className="btn-primary text-sm">＋ جديد</Link>
      </div>
      <input className="input" placeholder="بحث برقم الأم أو المولود..." value={search} onChange={e=>setSearch(e.target.value)} />
      {filtered.length === 0 ? (
        <div className="card text-center py-16"><div className="text-5xl mb-3">🐑</div><p className="text-gray-500">لا توجد سجلات</p><Link href="/births/new" className="btn-primary mt-4 inline-block">سجّل أول ولادة</Link></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b:any) => {
            const exp = b.expected_birth ? new Date(b.expected_birth) : getExpectedBirthDate(getMatingDate(b.birth_date))
            const days = daysUntil(exp)
            return (
              <Link key={b.id} href={`/births/${b.id}`}>
                <div className="card-hover">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-green-primary">🐑 {b.mom_id}</span>
                        {b.in_breeding && <span className={cn('badge text-xs', days < 0 ? 'badge-red' : 'badge-gold')}>{days < 0 ? `متأخرة ${Math.abs(days)}` : `${days} يوم`}</span>}
                      </div>
                      <p className="text-xs text-gray-500">{formatShortDate(b.birth_date)} · {b.birth_type} · {b.birth_count} مولود</p>
                    </div>
                    <span className="text-gray-400">‹</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
