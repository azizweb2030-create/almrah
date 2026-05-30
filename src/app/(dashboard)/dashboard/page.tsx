'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export default function DashboardPage() {
  const [flock, setFlock] = useState<any>(null)
  const [births, setBirths] = useState<any[]>([])
  const [vet, setVet] = useState<any[]>([])
  const [stats, setStats] = useState({ bahm:0, rakhalWean:0, rakhalReady:0, kharafSale:0, breeding:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r=>r.json()),
      fetch('/api/births').then(r=>r.json()),
      fetch('/api/vet/isolation').then(r=>r.json()),
    ]).then(([f, b, v]) => {
      setFlock(f.data)
      const allBirths: any[] = b.data || []
      setBirths(allBirths.slice(0, 5))
      setVet((v.data || []).filter((c:any) => c.active).slice(0, 5))

      // حساب المراحل بنفس منطق الكود الأصلي
      let bahm=0, rakhalWean=0, rakhalReady=0, kharafSale=0
      const now = new Date()
      allBirths.forEach((r:any) => {
        const birthDate = r.original_birth_date || r.birth_date
        const months = birthDate ? (now.getTime() - new Date(birthDate).getTime()) / (1000*60*60*24*30.44) : 0
        ;(r.babies||[]).forEach((b:any) => {
          if (b.health === 'نفوق') return
          if (!b.stage && months < 3) bahm++
          if (b.gender === 'رخل') {
            if (b.stage === 'مفطوم' || (!b.stage && months >= 3 && months < 7)) rakhalWean++
            if (b.stage === 'جاهز للإنتاج' || (!b.stage && months >= 7)) rakhalReady++
          } else {
            if (b.stage === 'جاهز للبيع' || (!b.stage && months >= 3)) kharafSale++
          }
        })
      })
      const breeding = allBirths.filter((r:any) => r.in_breeding).length
      setStats({ bahm, rakhalWean, rakhalReady, kharafSale, breeding })
      setLoading(false)
      // تحديث المراحل في الخلفية
      fetch('/api/babies/stages', { method: 'POST' }).catch(()=>{})
    })
  }, [])

  // ولادات قريبة (شبك نشط)
  const upcoming = births.filter((b:any) => b.in_breeding && b.breeding_date).map((b:any) => {
    const bd = new Date(b.breeding_date)
    bd.setDate(bd.getDate() + 150)
    const daysLeft = Math.ceil((bd.getTime() - Date.now()) / (1000*60*60*24))
    return { ...b, daysLeft, expectedDate: bd.toISOString().split('T')[0] }
  }).filter((b:any) => b.daysLeft >= 0 && b.daysLeft <= 30).sort((a:any,b:any) => a.daysLeft - b.daysLeft)

  if (loading) return (
    <div className="space-y-6">
      <h1 className="page-title">🐑 لوحة المتابعة</h1>
      <div className="grid grid-cols-2 gap-3">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-24 rounded-2xl"/>)}</div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">🐑 لوحة المتابعة</h1>
        <span className="badge-green text-xs">نشط</span>
      </div>

      {/* الإجمالي + الفحول + الشبك */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card text-center">
          <span className="text-xl">🐑</span>
          <div className="stat-value text-2xl">{flock?.total_sheep || 0}</div>
          <div className="stat-label">الإجمالي</div>
        </div>
        <div className="stat-card text-center">
          <span className="text-xl">🔗</span>
          <div className="stat-value text-2xl text-[#c9a84c]">{stats.breeding}</div>
          <div className="stat-label">في الشبك</div>
        </div>
        <div className="stat-card text-center">
          <span className="text-xl">🩺</span>
          <div className="stat-value text-2xl text-red-500">{vet.length}</div>
          <div className="stat-label">معزول</div>
        </div>
      </div>

      {/* مراحل المواليد — مطابق للكود الأصلي */}
      {(stats.bahm + stats.rakhalWean + stats.rakhalReady + stats.kharafSale) > 0 && (
        <div className="card">
          <p className="text-xs font-bold text-gray-500 mb-3">📊 تصنيف المواليد</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { l:'البهم', v:stats.bahm, icon:'🍼', c:'text-blue-600' },
              { l:'رخال مفطومة', v:stats.rakhalWean, icon:'🔔', c:'text-amber-600' },
              { l:'رخال جاهزة للإنتاج', v:stats.rakhalReady, icon:'🌿', c:'text-green-primary' },
              { l:'خرفان جاهزة للبيع', v:stats.kharafSale, icon:'🏷️', c:'text-purple-600' },
            ].map(s=>(
              <div key={s.l} className="bg-beige-primary rounded-xl p-3 flex items-center gap-2">
                <span className="text-lg">{s.icon}</span>
                <div>
                  <div className={cn('text-lg font-black', s.c)}>{s.v}</div>
                  <div className="text-xs text-gray-500">{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* أزرار سريعة */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {href:'/births/new',icon:'➕',label:'تسجيل ولادة',cls:'bg-green-subtle text-green-primary border-green-primary/20'},
          {href:'/vet/isolation/new',icon:'🩺',label:'عزل بيطري',cls:'bg-blue-50 text-blue-700 border-blue-200'},
          {href:'/deaths/new',icon:'📋',label:'تسجيل نفوق',cls:'bg-red-50 text-red-600 border-red-200'},
          {href:'/ai',icon:'🤖',label:'مساعد AI',cls:'bg-purple-50 text-purple-700 border-purple-200'},
        ].map(a=>(
          <Link key={a.href} href={a.href}
            className={cn('border rounded-2xl p-3 flex items-center gap-3 hover:opacity-80 transition-opacity', a.cls)}>
            <span className="text-2xl">{a.icon}</span>
            <span className="text-sm font-medium">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* ولادات قريبة */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-2">⏰ ولادات قريبة</h2>
          <div className="space-y-2">
            {upcoming.map((b:any) => (
              <Link key={b.id} href={`/births/${b.id}`}>
                <div className={cn('card-hover flex items-center justify-between', b.daysLeft<=7?'border-red-200 bg-red-50/30':'')}>
                  <div>
                    <p className="font-medium text-sm">الأم: {b.mom_id}{b.mom_color&&` · ${b.mom_color}`}</p>
                    <p className="text-xs text-gray-500">المتوقع: {b.expectedDate}</p>
                  </div>
                  <div className={cn('text-center px-3 py-1.5 rounded-xl font-bold text-sm', b.daysLeft<=7?'bg-red-100 text-red-600':'bg-[#fdf8ec] text-[#a8872e]')}>
                    {b.daysLeft}<div className="text-xs font-normal">يوم</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="text-base font-bold mb-2">🐑 آخر الولادات</h2>
          {births.length===0 ? <div className="card text-center py-8 text-sm text-gray-400">لا سجلات</div> : (
            <div className="space-y-2">
              {births.map((b:any) => {
                const alive=(b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length
                return (
                  <Link key={b.id} href={`/births/${b.id}`}>
                    <div className="card-hover flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">الأم: {b.mom_id}{b.mom_color&&` · ${b.mom_color}`}</p>
                        <p className="text-xs text-gray-500">{b.birth_date}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="badge-green text-xs">{alive} حي</span>
                        {b.in_breeding && <span className="badge badge-gold text-xs">🔗</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-base font-bold mb-2">🩺 العزل النشط</h2>
          {vet.length===0 ? <div className="card text-center py-8 text-sm text-gray-400">لا حالات</div> : (
            <div className="space-y-2">
              {vet.map((v:any)=>(
                <Link key={v.id} href={`/vet/isolation/${v.id}`}>
                  <div className="card-hover flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{v.animal_id}</p>
                      <p className="text-xs text-gray-500 truncate">{v.disease||v.status}</p>
                    </div>
                    <span className="badge-red text-xs">نشط</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
