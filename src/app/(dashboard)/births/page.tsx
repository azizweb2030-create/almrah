'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export default function BirthsPage() {
  const [births, setBirths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all'|'breeding'|'home'>('all')

  useEffect(() => {
    fetch('/api/births').then(r=>r.json()).then(j=>{setBirths(j.data||[]);setLoading(false)})
  }, [])

  const filtered = births.filter(b => {
    const matchSearch = !search || b.mom_id?.includes(search) || (b.babies||[]).some((bb:any)=>bb.baby_id?.includes(search))
    if (!matchSearch) return false
    if (filter === 'breeding') return b.in_breeding
    if (filter === 'home') return !b.hidden_from_home
    return true
  })

  const breedingCount = births.filter(b=>b.in_breeding).length
  const hiddenCount = births.filter(b=>b.hidden_from_home && !b.in_breeding).length

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-20"/>)}</div>

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">🐑 الولادات</h1>
        <Link href="/births/new" className="btn-primary text-sm px-4 py-2">＋ جديدة</Link>
      </div>

      {/* فلتر */}
      <div className="flex gap-2">
        {[
          { k:'all', l:`الكل (${births.length})` },
          { k:'breeding', l:`🔗 الشبك (${breedingCount})` },
          { k:'home', l:`🏠 الرئيسية (${births.length - hiddenCount})` },
        ].map(f=>(
          <button key={f.k} onClick={()=>setFilter(f.k as any)}
            className={cn('flex-1 py-2 rounded-xl text-xs font-medium border transition-colors', filter===f.k?'bg-green-primary text-white':'bg-white border-beige-border text-gray-600')}>
            {f.l}
          </button>
        ))}
      </div>

      <input className="input" placeholder="بحث برقم الأم أو المولود..." value={search} onChange={e=>setSearch(e.target.value)} />

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🐑</div>
          <p className="text-gray-500">{births.length===0 ? 'لا توجد سجلات بعد' : 'لا نتائج للبحث'}</p>
          {births.length===0 && <Link href="/births/new" className="btn-primary mt-4 inline-block">سجّل أول ولادة</Link>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b:any) => {
            const alive = (b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length
            const daysSince = b.birth_date
              ? Math.round((Date.now()-new Date(b.birth_date).getTime())/(1000*60*60*24))
              : null
            const canBreed = daysSince !== null && daysSince >= 15 && !b.in_breeding && !b.hidden_from_home
            // عداد الشبك
            let daysLeft: number|null = null
            if (b.in_breeding && b.breeding_date) {
              const exp = new Date(b.breeding_date)
              exp.setDate(exp.getDate()+150)
              daysLeft = Math.ceil((exp.getTime()-Date.now())/(1000*60*60*24))
            }
            return (
              <Link key={b.id} href={`/births/${b.id}`}>
                <div className={cn('card-hover', b.in_breeding?'border-[#c9a84c]/40':'')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-black text-green-primary">🐑 {b.mom_id}</span>
                        {b.mom_color && <span className="text-xs text-gray-400">{b.mom_color}</span>}
                        {b.in_breeding && <span className="badge badge-gold text-xs">🔗 شبك</span>}
                        {canBreed && <span className="badge badge-gray text-xs">⏳ جاهزة للشبك</span>}
                      </div>
                      <p className="text-xs text-gray-500">{b.birth_date} · {alive} مولود حي · {(b.babies||[]).length} إجمالي</p>
                      {daysLeft !== null && (
                        <p className={cn('text-xs font-medium mt-0.5', daysLeft<=14?'text-red-500':'text-[#c9a84c]')}>
                          {daysLeft<0 ? `⚠️ متأخرة ${Math.abs(daysLeft)} يوم` : `⏰ ${daysLeft} يوم للولادة`}
                        </p>
                      )}
                    </div>
                    <span className="text-gray-400 flex-shrink-0">‹</span>
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
