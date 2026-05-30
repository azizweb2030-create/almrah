'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [flock, setFlock] = useState<any>(null)
  const [births, setBirths] = useState<any[]>([])
  const [vet, setVet] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r=>r.json()),
      fetch('/api/births').then(r=>r.json()),
      fetch('/api/vet/isolation').then(r=>r.json()),
    ]).then(([f,b,v]) => {
      setFlock(f.data)
      setBirths((b.data||[]).slice(0,5))
      setVet((v.data||[]).filter((c:any)=>c.active).slice(0,5))
      setLoading(false)
    })
  }, [])

  // حساب الولادات المتوقعة (شبك التلقيح النشط)
  const upcoming = births.filter(b => b.in_breeding && !b.hidden_from_home).map(b => {
    const breedingDate = new Date(b.breeding_date || b.birth_date)
    const expectedDate = new Date(breedingDate)
    expectedDate.setDate(expectedDate.getDate() + 150)
    const daysLeft = Math.ceil((expectedDate.getTime() - Date.now()) / (1000*60*60*24))
    return { ...b, daysLeft, expectedDate: expectedDate.toISOString().split('T')[0] }
  }).filter(b => b.daysLeft >= 0 && b.daysLeft <= 30).sort((a,b) => a.daysLeft - b.daysLeft)

  if (loading) return (
    <div className="space-y-6">
      <div className="page-header"><h1 className="page-title">لوحة المتابعة</h1></div>
      <div className="grid grid-cols-2 gap-3">{[...Array(2)].map((_,i)=><div key={i} className="skeleton h-24 rounded-2xl"/>)}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">لوحة المتابعة</h1>
        <span className="badge-green">نشط</span>
      </div>

      {/* إجمالي القطيع */}
      <div className="stat-card">
        <span className="text-3xl">🐑</span>
        <div className="stat-value">{flock?.total_sheep || 0}</div>
        <div className="stat-label">إجمالي القطيع</div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {href:'/births/new',icon:'➕',label:'ولادة جديدة',cls:'bg-green-subtle text-green-primary'},
          {href:'/vet/isolation/new',icon:'🩺',label:'عزل بيطري',cls:'bg-blue-50 text-blue-700'},
          {href:'/deaths/new',icon:'📋',label:'تسجيل نفوق',cls:'bg-red-50 text-red-600'},
          {href:'/ai',icon:'🤖',label:'المساعد AI',cls:'bg-purple-50 text-purple-700'},
        ].map(a=>(
          <Link key={a.href} href={a.href} className={`border rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 transition-all border-current/20 ${a.cls}`}>
            <span className="text-2xl">{a.icon}</span>
            <span className="text-xs font-medium text-center">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* ولادات قريبة */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3">⏰ ولادات قريبة</h2>
          <div className="space-y-2">
            {upcoming.map((b:any) => (
              <div key={b.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">الأم: {b.mom_id} {b.mom_color&&`· ${b.mom_color}`}</p>
                  <p className="text-xs text-gray-500">متوقع: {b.expectedDate}</p>
                </div>
                <div className={`text-center px-3 py-1 rounded-xl font-bold text-sm ${b.daysLeft<=7?'bg-red-50 text-red-600':'bg-gold-subtle text-gold-dark'}`}>
                  {b.daysLeft}<div className="text-xs font-normal">يوم</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* آخر الولادات + العزل */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="text-base font-bold mb-3">🐑 آخر الولادات</h2>
          {births.length === 0 ? <div className="card text-center py-8 text-sm text-gray-400">لا توجد سجلات</div> : (
            <div className="space-y-2">
              {births.map((b:any) => {
                const alive = (b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length
                return (
                  <Link key={b.id} href={`/births/${b.id}`}>
                    <div className="card-hover flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">الأم: {b.mom_id} {b.mom_color&&`· ${b.mom_color}`}</p>
                        <p className="text-xs text-gray-500">{b.birth_date}</p>
                      </div>
                      <span className="badge-green text-xs">{alive} حي</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-base font-bold mb-3">🩺 العزل النشط</h2>
          {vet.length === 0 ? <div className="card text-center py-8 text-sm text-gray-400">لا حالات عزل</div> : (
            <div className="space-y-2">
              {vet.map((v:any)=>(
                <Link key={v.id} href={`/vet/isolation/${v.id}`}>
                  <div className="card-hover flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{v.animal_id}</p>
                      <p className="text-xs text-gray-500 truncate">{v.disease}</p>
                    </div>
                    <span className={`badge text-xs ${v.severity==='حرجة'?'badge-red':'badge-gray'}`}>{v.severity}</span>
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
