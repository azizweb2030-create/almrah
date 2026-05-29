'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatShortDate, daysUntil, getMatingDate, getExpectedBirthDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

export default function DashboardPage() {
  const [flock, setFlock] = useState<any>(null)
  const [births, setBirths] = useState<any[]>([])
  const [vet, setVet] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/flock').then(r=>r.json()).then(j => setFlock(j.data))
    fetch('/api/births').then(r=>r.json()).then(j => setBirths((j.data||[]).slice(0,5)))
    fetch('/api/vet/isolation').then(r=>r.json()).then(j => setVet((j.data||[]).filter((c:any) => c.status==='معزول').slice(0,5)))
  }, [])

  const stats = [
    { key:'total_count', icon:'🐑', label:'الإجمالي', color:'text-green-primary' },
    { key:'productive_count', icon:'🌟', label:'المنتجة', color:'text-gold-dark' },
    { key:'bahm_count', icon:'🍼', label:'البهم', color:'text-blue-500' },
    { key:'death_count', icon:'📋', label:'النفوق', color:'text-red-500' },
  ]

  const upcoming = births.filter(b => b.in_breeding).map(b => {
    const exp = b.expected_birth ? new Date(b.expected_birth) : getExpectedBirthDate(getMatingDate(b.birth_date))
    return { ...b, days: daysUntil(exp) }
  }).filter(b => b.days >= 0 && b.days <= 30).sort((a,b) => a.days - b.days)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">لوحة المتابعة</h1>
        <span className="badge-green">نشط</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.key} className="stat-card">
            <span className="text-2xl">{s.icon}</span>
            <div className={cn('stat-value', s.color)}>{flock ? (flock[s.key] || 0) : '—'}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href:'/births/new', icon:'➕', label:'ولادة جديدة', cls:'bg-green-subtle text-green-primary' },
          { href:'/vet/isolation/new', icon:'🩺', label:'إضافة عزل', cls:'bg-blue-50 text-blue-700' },
          { href:'/deaths/new', icon:'📋', label:'تسجيل نفوق', cls:'bg-red-50 text-red-600' },
          { href:'/ai', icon:'🤖', label:'المساعد', cls:'bg-purple-50 text-purple-700' },
        ].map(a => (
          <Link key={a.href} href={a.href} className={cn('border rounded-2xl p-3 flex flex-col items-center gap-2 hover:scale-105 transition-all border-current/20', a.cls)}>
            <span className="text-2xl">{a.icon}</span>
            <span className="text-xs font-medium text-center">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Upcoming births */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3">⏰ ولادات قريبة</h2>
          <div className="space-y-2">
            {upcoming.map((b:any) => (
              <div key={b.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">الأم: {b.mom_id}</p>
                  <p className="text-xs text-gray-500">{formatShortDate(b.birth_date)}</p>
                </div>
                <div className={cn('text-center px-3 py-1 rounded-xl font-bold text-sm', b.days <= 7 ? 'bg-red-50 text-red-600' : 'bg-gold-subtle text-gold-dark')}>
                  {b.days}<div className="text-[10px] font-normal">يوم</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="text-base font-bold mb-3">🐑 آخر الولادات</h2>
          {births.length === 0 ? <div className="card text-center py-8 text-sm text-gray-400">لا توجد سجلات</div> : (
            <div className="space-y-2">
              {births.map((b:any) => (
                <Link key={b.id} href={`/births/${b.id}`}>
                  <div className="card-hover flex items-center justify-between">
                    <div><p className="font-medium text-sm">الأم: {b.mom_id}</p><p className="text-xs text-gray-500">{formatShortDate(b.birth_date)}</p></div>
                    <span className="badge-green text-xs">{b.birth_count} {b.birth_type}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-base font-bold mb-3">🩺 العزل البيطري</h2>
          {vet.length === 0 ? <div className="card text-center py-8 text-sm text-gray-400">لا حالات عزل</div> : (
            <div className="space-y-2">
              {vet.map((v:any) => (
                <Link key={v.id} href={`/vet/isolation/${v.id}`}>
                  <div className="card-hover flex items-center justify-between">
                    <div><p className="font-medium text-sm">{v.animal_id}</p><p className="text-xs text-gray-500 truncate">{v.reason}</p></div>
                    <span className={cn('badge text-xs', v.severity==='طارئ'?'badge-red':'badge-gray')}>{v.severity}</span>
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
