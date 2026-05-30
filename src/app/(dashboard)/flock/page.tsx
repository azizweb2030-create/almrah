'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

const COLORS = ['أبيض','أسود','بني','رمادي','أحمر','مختلط']

export default function FlockPage() {
  const [flock, setFlock] = useState<any>(null)
  const [rams, setRams] = useState<any[]>([])
  const [births, setBirths] = useState<any[]>([])
  const [tab, setTab] = useState<'flock'|'rams'>('flock')
  const [editing, setEditing] = useState(false)
  const [totalSheep, setTotalSheep] = useState(0)
  const [ramForm, setRamForm] = useState({ram_id:'',name:'',color:''})
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r=>r.json()),
      fetch('/api/rams').then(r=>r.json()),
      fetch('/api/births').then(r=>r.json()),
    ]).then(([f,r,b]) => {
      setFlock(f.data)
      setTotalSheep(f.data?.total_sheep||0)
      setRams(r.data||[])
      setBirths(b.data||[])
    })
  }, [])

  // إحصائيات مطابقة للكود الأصلي
  const producerSet = new Set((births).map((r:any)=>r.mom_id+'_'+r.mom_color))
  const producerCount = producerSet.size
  const breedingCount = births.filter((r:any)=>r.in_breeding).length
  const activeRams = rams.filter(r=>!r.dead)

  let bahm=0, rakhalWean=0, rakhalReady=0, kharafSale=0
  const now = new Date()
  births.forEach((r:any) => {
    const bd = r.original_birth_date || r.birth_date
    const months = bd ? (now.getTime()-new Date(bd).getTime())/(1000*60*60*24*30.44) : 0
    ;(r.babies||[]).forEach((b:any) => {
      if (b.health==='نفوق') return
      if (!b.stage && months<3) bahm++
      if (b.gender==='رخل') {
        if (b.stage==='مفطوم'||(!b.stage&&months>=3&&months<7)) rakhalWean++
        if (b.stage==='جاهز للإنتاج'||(!b.stage&&months>=7)) rakhalReady++
      } else {
        if (b.stage==='جاهز للبيع'||(!b.stage&&months>=3)) kharafSale++
      }
    })
  })

  async function saveFlock() {
    setSaving(true)
    const res = await fetch('/api/flock',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({total_sheep:totalSheep})})
    const j = await res.json()
    setFlock(j.data); setEditing(false); setSaving(false); toast.success('تم الحفظ ✅')
  }

  async function addRam() {
    if (!ramForm.ram_id.trim()) { toast.error('رقم الفحل مطلوب'); return }
    setSaving(true)
    const res = await fetch('/api/rams',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ramForm)})
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    setRams(p=>[j.data,...p]); setShowNew(false); setRamForm({ram_id:'',name:'',color:''}); setSaving(false); toast.success('تمت الإضافة ✅')
  }

  async function markDead(id:string) {
    await fetch(`/api/rams/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({dead:true})})
    setRams(p=>p.map(r=>r.id===id?{...r,dead:true}:r)); toast.success('تم تحديث الفحل')
  }

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">📊 القطيع والفحول</h1>
        {tab==='flock'&&!editing && <button onClick={()=>setEditing(true)} className="btn-secondary text-sm px-3 py-1.5">✏️ تعديل الإجمالي</button>}
        {tab==='rams' && <button onClick={()=>setShowNew(p=>!p)} className="btn-primary text-sm">{showNew?'إلغاء':'＋ فحل'}</button>}
      </div>

      <div className="flex gap-2">
        {[{k:'flock',l:'🐑 القطيع'},{k:'rams',l:`🐏 الفحول (${activeRams.length})`}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k as any)}
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors', tab===t.k?'bg-green-primary text-white':'bg-white border-beige-border text-gray-600')}>
            {t.l}
          </button>
        ))}
      </div>

      {tab==='flock' && (
        <div className="space-y-4">
          {/* الإجمالي */}
          {editing ? (
            <div className="card space-y-4">
              <h3 className="font-bold">تعديل إجمالي القطيع</h3>
              <div>
                <label className="label">إجمالي الأغنام</label>
                <input type="number" min="0" className="input text-2xl font-black text-center" value={totalSheep} onChange={e=>setTotalSheep(parseInt(e.target.value)||0)}/>
              </div>
              <div className="flex gap-2">
                <button onClick={saveFlock} className="btn-primary flex-1" disabled={saving}>{saving?'⏳...':'💾 حفظ'}</button>
                <button onClick={()=>{setEditing(false);setTotalSheep(flock?.total_sheep||0)}} className="btn-secondary px-5">إلغاء</button>
              </div>
            </div>
          ) : (
            <div className="stat-card">
              <span className="text-3xl">🐑</span>
              <div className="stat-value">{flock?.total_sheep||0}</div>
              <div className="stat-label">إجمالي القطيع</div>
            </div>
          )}

          {/* إحصائيات مطابقة للكود الأصلي */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {l:'المنتجات', v:producerCount, icon:'🐑', c:'text-green-primary'},
              {l:'في الشبك', v:breedingCount, icon:'🔗', c:'text-[#c9a84c]'},
              {l:'الفحول النشطة', v:activeRams.length, icon:'🐏', c:'text-blue-600'},
              {l:'البهم', v:bahm, icon:'🍼', c:'text-purple-500'},
            ].map(s=>(
              <div key={s.l} className="stat-card flex-row items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <div className={cn('text-xl font-black', s.c)}>{s.v}</div>
                  <div className="stat-label text-xs">{s.l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* مراحل المواليد */}
          {(rakhalWean+rakhalReady+kharafSale) > 0 && (
            <div className="card">
              <p className="text-xs font-bold text-gray-500 mb-3">تصنيف المواليد</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {l:'رخال مفطومة', v:rakhalWean, icon:'🔔', c:'text-amber-600'},
                  {l:'رخال جاهزة للإنتاج', v:rakhalReady, icon:'🌿', c:'text-green-primary'},
                  {l:'خرفان جاهزة للبيع', v:kharafSale, icon:'🏷️', c:'text-purple-600'},
                ].map(s=>(
                  <div key={s.l} className="bg-beige-primary rounded-xl p-2 text-center">
                    <div className="text-lg">{s.icon}</div>
                    <div className={cn('text-lg font-black', s.c)}>{s.v}</div>
                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab==='rams' && (
        <div className="space-y-3">
          {showNew && (
            <div className="card space-y-3">
              <h3 className="font-bold text-sm">إضافة فحل جديد</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label text-xs">رقم الفحل *</label><input className="input text-sm" placeholder="F001" value={ramForm.ram_id} onChange={e=>setRamForm(p=>({...p,ram_id:e.target.value}))}/></div>
                <div><label className="label text-xs">الاسم</label><input className="input text-sm" placeholder="اختياري" value={ramForm.name} onChange={e=>setRamForm(p=>({...p,name:e.target.value}))}/></div>
              </div>
              <div>
                <label className="label text-xs">اللون</label>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map(c=>(
                    <button key={c} type="button" onClick={()=>setRamForm(p=>({...p,color:c}))}
                      className={cn('px-2.5 py-1 rounded-lg text-xs border', ramForm.color===c?'bg-green-primary text-white':'bg-white border-beige-border')}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addRam} className="btn-primary flex-1 text-sm" disabled={saving}>{saving?'⏳...':'💾 إضافة'}</button>
                <button onClick={()=>setShowNew(false)} className="btn-secondary px-4 text-sm">إلغاء</button>
              </div>
            </div>
          )}
          {rams.length===0 ? (
            <div className="card text-center py-10 text-gray-400"><p>لا توجد فحول مسجلة</p></div>
          ) : (
            rams.map((r:any) => (
              <div key={r.id} className={cn('card flex items-center justify-between', r.dead&&'opacity-50')}>
                <div>
                  <p className="font-bold">{r.ram_id}{r.name&&` — ${r.name}`}</p>
                  <p className="text-xs text-gray-500">{r.color||'—'} · {r.added_at||'—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('badge text-xs', r.dead?'badge-red':'badge-green')}>{r.dead?'نافق':'نشط'}</span>
                  {!r.dead && (
                    <button onClick={()=>markDead(r.id)} className="text-xs text-red-400 hover:text-red-600">تسجيل نفوق</button>
                  )}
                </div>
              </div>
            ))
          )}
          {rams.filter(r=>r.dead).length>0 && (
            <p className="text-xs text-center text-gray-400">{rams.filter(r=>r.dead).length} فحل نافق</p>
          )}
        </div>
      )}
    </div>
  )
}
