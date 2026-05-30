'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [flock, setFlock] = useState<any>(null)
  const [births, setBirths] = useState<any[]>([])
  const [deaths, setDeaths] = useState<any[]>([])
  const [vet, setVet] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r => r.json()),
      fetch('/api/births').then(r => r.json()),
      fetch('/api/deaths').then(r => r.json()),
      fetch('/api/vet/isolation').then(r => r.json()),
    ]).then(([f, b, d, v]) => {
      setFlock(f.data); setBirths(b.data || [])
      setDeaths(d.data || []); setVet(v.data || [])
      setLoading(false)
      // تحديث مراحل المواليد في الخلفية
      fetch('/api/babies/stages', { method: 'POST' }).catch(() => {})
    })
  }, [])

  async function exportPDF() {
    setExporting(true)
    try {
      const { generateFlockReport } = await import('@/lib/pdf/generator')
      await generateFlockReport({
        farmName: 'المراح',
        totalSheep: flock?.total_sheep || 0,
        totalBirths: births.length,
        aliveBabies: births.reduce((s, b) => s + (b.babies || []).filter((bb: any) => bb.health !== 'نفوق').length, 0),
        totalDeaths: deaths.length,
        activeVet: vet.filter(v => v.active).length,
        births,
      })
      toast.success('✅ تم تصدير التقرير')
    } catch (e) {
      toast.error('فشل تصدير PDF')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl"/>)}</div>

  const totalBabies = births.reduce((sum, b) => sum + (b.babies || []).filter((bb: any) => bb.health !== 'نفوق').length, 0)
  const activeVetCount = vet.filter(v => v.active).length
  const monthlyMap: Record<string, number> = {}
  births.forEach(b => { const m = b.birth_date?.slice(0, 7)||''; if(m) monthlyMap[m]=(monthlyMap[m]||0)+1 })
  const monthlyBirths = Object.entries(monthlyMap).sort().slice(-6)
  const maxMonthly = Math.max(...monthlyBirths.map(([,c])=>c), 1)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">📈 التقارير</h1>
        <button onClick={exportPDF} disabled={exporting} className="btn-gold flex items-center gap-1.5 text-sm">
          <span>📄</span><span>{exporting ? 'جاري...' : 'تصدير PDF'}</span>
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'إجمالي القطيع', v: flock?.total_sheep || 0, icon: '🐑', c: 'text-green-primary' },
          { l: 'سجلات الولادة', v: births.length, icon: '📋', c: 'text-blue-600' },
          { l: 'مواليد أحياء', v: totalBabies, icon: '🍼', c: 'text-amber-600' },
          { l: 'حالات بيطرية', v: activeVetCount, icon: '🩺', c: 'text-red-500' },
        ].map(k => (
          <div key={k.l} className="stat-card">
            <span className="text-2xl">{k.icon}</span>
            <div className={`stat-value ${k.c}`}>{k.v}</div>
            <div className="stat-label">{k.l}</div>
          </div>
        ))}
      </div>

      {monthlyBirths.length > 0 && (
        <div className="card">
          <h2 className="font-bold mb-4">📅 الولادات الشهرية</h2>
          <div className="space-y-2">
            {monthlyBirths.map(([month, count]) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-16 flex-shrink-0">{month.replace('-','/')}</span>
                <div className="flex-1 bg-beige-border rounded-full h-2 overflow-hidden">
                  <div className="bg-green-primary h-2 rounded-full" style={{width:`${(count/maxMonthly)*100}%`}}/>
                </div>
                <span className="text-sm font-bold text-green-primary w-5">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-bold mb-3">🐑 آخر سجلات الولادة</h2>
        {births.length === 0 ? (
          <p className="text-center text-gray-400 py-6">لا توجد سجلات</p>
        ) : (
          <div className="space-y-2">
            {births.slice(0, 10).map((b: any) => {
              const alive = (b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length
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
