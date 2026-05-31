'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

const COLORS: Record<string,string> = {
  'أبيض':'bg-gray-100 text-gray-700',
  'أسود':'bg-gray-800 text-white',
  'بني':'bg-amber-100 text-amber-800',
  'رمادي':'bg-slate-100 text-slate-700',
  'أحمر':'bg-red-100 text-red-700',
  'مختلط':'bg-gradient-to-r from-amber-100 to-gray-100 text-gray-700',
}

export default function ProductionPage() {
  const [moms, setMoms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const url = search.length >= 1 ? `/api/production?q=${search}` : '/api/production'
    setLoading(true)
    fetch(url).then(r=>r.json()).then(j=>{setMoms(j.data||[]);setLoading(false)})
  }, [search])

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-28"/>)}</div>

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">📋 سجل إنتاج الأمهات</h1>
        <span className="badge-green">{moms.length} أم</span>
      </div>

      <input className="input" placeholder="ابحث برقم الأم..." value={search}
        onChange={e=>setSearch(e.target.value)} />

      {moms.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🐑</div>
          <p className="text-gray-500">{search ? 'لم تنتج هذه الأم من قبل' : 'لا توجد سجلات'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {moms.map((m:any) => (
            <div key={`${m.mom_id}_${m.mom_color}`} className="card space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold', COLORS[m.mom_color]||'bg-beige-primary text-gray-700')}>
                  🐑
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-black">{m.mom_id}</span>
                    {m.mom_color && <span className="badge badge-gray text-xs">{m.mom_color}</span>}
                    <span className={cn('badge text-xs', m.status==='منتجة حالياً'?'badge-green':'badge-gold')}>{m.status}</span>
                    {m.lastInBreeding && <span className="badge badge-gold text-xs">🔗 شبك</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">آخر ولادة: {m.lastBirthDate||'—'}</p>
                </div>
                <div className="text-center bg-beige-primary rounded-2xl px-3 py-2">
                  <div className="text-2xl font-black text-green-primary">{m.totalBirths}</div>
                  <div className="text-[10px] text-gray-500">ولادة</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-beige-primary rounded-xl p-2.5 text-center">
                  <div className="text-lg font-black text-blue-600">{m.totalAlive}</div>
                  <div className="text-[10px] text-gray-500">مواليد أحياء</div>
                </div>
                <div className="bg-beige-primary rounded-xl p-2.5 text-center">
                  <div className="text-lg font-black text-amber-600">{m.totalBirths}</div>
                  <div className="text-[10px] text-gray-500">ولادة مسجلة</div>
                </div>
              </div>

              <div className="space-y-1">
                {m.recs.slice(0,3).map((r:any,i:number)=>{
                  const alive=(r.babies||[]).filter((b:any)=>b.health!=='نفوق').length
                  return (
                    <Link key={i} href={`/births/${r.id}`} className="flex items-center justify-between text-xs text-gray-500 hover:text-gray-900 py-1 border-t border-beige-border/50">
                      <span>📅 {r.birth_date}</span>
                      <span>{alive} حي {r.in_breeding?'· 🔗':''}</span>
                    </Link>
                  )
                })}
                {m.recs.length > 3 && <p className="text-xs text-gray-400 text-center">+{m.recs.length-3} ولادة أخرى</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
