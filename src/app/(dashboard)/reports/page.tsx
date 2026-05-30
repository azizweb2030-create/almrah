'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

export default function ReportsPage() {
  const [flock, setFlock] = useState<any>(null)
  const [births, setBirths] = useState<any[]>([])
  const [deaths, setDeaths] = useState<any[]>([])
  const [vet, setVet] = useState<any[]>([])
  const [rams, setRams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r=>r.json()),
      fetch('/api/births').then(r=>r.json()),
      fetch('/api/deaths').then(r=>r.json()),
      fetch('/api/vet/isolation').then(r=>r.json()),
      fetch('/api/rams').then(r=>r.json()),
    ]).then(([f,b,d,v,r]) => {
      setFlock(f.data); setBirths(b.data||[]); setDeaths(d.data||[])
      setVet(v.data||[]); setRams(r.data||[])
      setLoading(false)
      fetch('/api/babies/stages',{method:'POST'}).catch(()=>{})
    })
  }, [])

  // حساب الإحصائيات بنفس منطق الكود الأصلي
  const totalBabies = births.reduce((s,b)=>s+(b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length,0)
  const now = new Date()
  let bahm=0, rakhalWean=0, rakhalReady=0, kharafSale=0
  births.forEach((r:any)=>{
    const bd=r.original_birth_date||r.birth_date
    const months=bd?(now.getTime()-new Date(bd).getTime())/(1000*60*60*24*30.44):0
    ;(r.babies||[]).forEach((b:any)=>{
      if(b.health==='نفوق') return
      if(!b.stage&&months<3) bahm++
      if(b.gender==='رخل'){
        if(b.stage==='مفطوم'||(!b.stage&&months>=3&&months<7)) rakhalWean++
        if(b.stage==='جاهز للإنتاج'||(!b.stage&&months>=7)) rakhalReady++
      } else {
        if(b.stage==='جاهز للبيع'||(!b.stage&&months>=3)) kharafSale++
      }
    })
  })
  const breeding=births.filter(b=>b.in_breeding).length
  const activeRams=rams.filter(r=>!r.dead).length
  const activeVet=vet.filter(v=>v.active).length

  // الولادات الشهرية
  const monthlyMap:Record<string,number>={}
  births.forEach(b=>{const m=b.birth_date?.slice(0,7)||''; if(m) monthlyMap[m]=(monthlyMap[m]||0)+1})
  const monthlyBirths=Object.entries(monthlyMap).sort().slice(-6)
  const maxM=Math.max(...monthlyBirths.map(([,c])=>c),1)

  async function exportPDF() {
    setExporting(true)
    try {
      const {generateFlockReport}=await import('@/lib/pdf/generator')
      await generateFlockReport({
        farmName:'المراح',
        totalSheep:flock?.total_sheep||0,
        totalBirths:births.length,
        aliveBabies:totalBabies,
        totalDeaths:deaths.length,
        activeVet,
        births,
        bahm, rakhalWean, rakhalReady, kharafSale,
        breeding, activeRams,
      })
      toast.success('✅ تم تصدير التقرير')
    } catch(e) { toast.error('فشل تصدير PDF') }
    setExporting(false)
  }

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-24 rounded-2xl"/>)}</div>

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">📈 التقارير</h1>
        <button onClick={exportPDF} disabled={exporting} className="btn-gold flex items-center gap-1.5 text-sm">
          <span>📄</span><span>{exporting?'جاري التصدير...':'تصدير PDF'}</span>
        </button>
      </div>

      {/* إحصائيات رئيسية */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {l:'إجمالي القطيع',v:flock?.total_sheep||0,icon:'🐑',c:'text-green-primary'},
          {l:'الأمهات',v:births.length,icon:'🐑',c:'text-green-primary'},
          {l:'مواليد أحياء',v:totalBabies,icon:'🍼',c:'text-blue-600'},
          {l:'إجمالي النفوق',v:deaths.length,icon:'📋',c:'text-red-500'},
        ].map(k=>(
          <div key={k.l} className="stat-card">
            <span className="text-2xl">{k.icon}</span>
            <div className={cn('stat-value',k.c)}>{k.v}</div>
            <div className="stat-label">{k.l}</div>
          </div>
        ))}
      </div>

      {/* تصنيف المواليد */}
      {(bahm+rakhalWean+rakhalReady+kharafSale)>0 && (
        <div className="card">
          <h2 className="font-bold mb-3 text-sm">📊 تصنيف المواليد</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              {l:'البهم',v:bahm,icon:'🍼',c:'text-blue-600'},
              {l:'رخال مفطومة',v:rakhalWean,icon:'🔔',c:'text-amber-600'},
              {l:'رخال جاهزة للإنتاج',v:rakhalReady,icon:'🌿',c:'text-green-primary'},
              {l:'خرفان جاهزة للبيع',v:kharafSale,icon:'🏷️',c:'text-purple-600'},
            ].map(s=>(
              <div key={s.l} className="bg-beige-primary rounded-xl p-3 flex items-center gap-2">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <div className={cn('text-lg font-black',s.c)}>{s.v}</div>
                  <div className="text-xs text-gray-500">{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {l:'في الشبك',v:breeding,icon:'🔗'},
          {l:'فحول نشطة',v:activeRams,icon:'🐏'},
          {l:'معزول بيطري',v:activeVet,icon:'🩺'},
        ].map(k=>(
          <div key={k.l} className="stat-card text-center">
            <span className="text-xl">{k.icon}</span>
            <div className="stat-value text-xl">{k.v}</div>
            <div className="stat-label text-xs">{k.l}</div>
          </div>
        ))}
      </div>

      {/* الولادات الشهرية */}
      {monthlyBirths.length>0 && (
        <div className="card">
          <h2 className="font-bold mb-4 text-sm">📅 الولادات الشهرية</h2>
          <div className="space-y-2">
            {monthlyBirths.map(([month,count])=>(
              <div key={month} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-16 flex-shrink-0 text-left">{month.replace('-','/')}</span>
                <div className="flex-1 bg-beige-border rounded-full h-2 overflow-hidden">
                  <div className="bg-green-primary h-2 rounded-full" style={{width:`${(count/maxM)*100}%`}}/>
                </div>
                <span className="text-sm font-bold text-green-primary w-5">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* آخر 10 ولادات */}
      <div className="card">
        <h2 className="font-bold mb-3 text-sm">🐑 آخر سجلات الولادة</h2>
        {births.length===0?<p className="text-center text-gray-400 py-6 text-sm">لا توجد سجلات</p>:(
          <div className="space-y-2">
            {births.slice(0,10).map((b:any)=>{
              const alive=(b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length
              return (
                <div key={b.id} className="flex items-center justify-between p-3 bg-beige-primary rounded-xl text-sm">
                  <div>
                    <span className="font-medium">الأم: {b.mom_id}</span>
                    {b.mom_color&&<span className="text-gray-400 mr-1">· {b.mom_color}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">{b.birth_date}</span>
                    <span className="badge-green text-xs">{alive} حي</span>
                    {b.in_breeding&&<span className="badge badge-gold text-xs">🔗</span>}
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
