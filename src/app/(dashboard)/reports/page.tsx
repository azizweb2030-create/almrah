'use client'
import { useState, useEffect } from 'react'

export default function ReportsPage() {
  const [flock, setFlock] = useState<any>(null)
  const [births, setBirths] = useState<any[]>([])
  const [deaths, setDeaths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r => r.json()),
      fetch('/api/births').then(r => r.json()),
      fetch('/api/deaths').then(r => r.json()),
    ]).then(([f, b, d]) => {
      setFlock(f.data); setBirths(b.data || []); setDeaths(d.data || []); setLoading(false)
    })
  }, [])

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl"/>)}</div>

  // إجمالي المواليد = مجموع الـ babies في كل سجل ولادة
  const totalBabies = births.reduce((sum, b) => sum + (b.babies || []).length, 0)
  const aliveBabies = births.reduce((sum, b) => sum + (b.babies || []).filter((bb: any) => bb.health !== 'نفوق').length, 0)

  // تجميع الولادات الشهرية
  const monthlyMap: Record<string, number> = {}
  births.forEach(b => {
    const month = b.birth_date?.slice(0, 7) || ''
    if (month) monthlyMap[month] = (monthlyMap[month] || 0) + 1
  })
  const monthlyBirths = Object.entries(monthlyMap).sort().slice(-6)

  return (
    <div className="space-y-6">
      <h1 className="page-title">📈 التقارير</h1>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'إجمالي القطيع', v: flock?.total_sheep || 0, icon: '🐑' },
          { l: 'سجلات الولادة', v: births.length, icon: '📋' },
          { l: 'مواليد أحياء', v: aliveBabies, icon: '🍼' },
          { l: 'النفوق', v: deaths.length, icon: '📋' },
        ].map(k => (
          <div key={k.l} className="stat-card">
            <span className="text-2xl">{k.icon}</span>
            <div className="stat-value">{k.v}</div>
            <div className="stat-label">{k.l}</div>
          </div>
        ))}
      </div>

      {/* الولادات الشهرية */}
      {monthlyBirths.length > 0 && (
        <div className="card">
          <h2 className="font-bold mb-4">📅 الولادات الشهرية</h2>
          <div className="space-y-2">
            {monthlyBirths.map(([month, count]) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-16 flex-shrink-0">{month.replace('-', '/')}</span>
                <div className="flex-1 bg-beige-border rounded-full h-2 overflow-hidden">
                  <div className="bg-green-primary h-2 rounded-full transition-all"
                    style={{ width: `${(count / Math.max(...monthlyBirths.map(([,c]) => c))) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-green-primary w-6 text-left">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* آخر الولادات */}
      <div className="card">
        <h2 className="font-bold mb-3">🐑 آخر سجلات الولادة</h2>
        {births.length === 0 ? (
          <p className="text-center text-gray-400 py-6">لا توجد سجلات</p>
        ) : (
          <div className="space-y-2">
            {births.slice(0, 10).map((b: any) => {
              const alive = (b.babies || []).filter((bb: any) => bb.health !== 'نفوق').length
              return (
                <div key={b.id} className="flex items-center justify-between p-3 bg-beige-primary rounded-xl text-sm">
                  <div>
                    <span className="font-medium">الأم: {b.mom_id}</span>
                    {b.mom_color && <span className="text-gray-400 mr-1">· {b.mom_color}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{b.birth_date}</span>
                    <span className="badge-green text-xs">{alive} حي</span>
                    {b.in_breeding && <span className="badge badge-gold text-xs">شبك</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
