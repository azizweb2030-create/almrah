'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

const COLORS = ['أبيض','أسود','بني','رمادي','أحمر','مختلط']

const MOM_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  green:  { bg:'bg-green-subtle',  text:'text-green-primary', dot:'bg-[#1e5a10]', label:'أخضر' },
  red:    { bg:'bg-red-50',         text:'text-red-600',       dot:'bg-red-500',   label:'أحمر'  },
  yellow: { bg:'bg-yellow-50',      text:'text-yellow-700',    dot:'bg-yellow-500',label:'أصفر'  },
  orange: { bg:'bg-orange-50',      text:'text-orange-600',    dot:'bg-orange-500',label:'برتقالي'},
}

function StatCard({ emoji, value, label, color, subLabel }: { emoji: string; value: number; label: string; color?: string; subLabel?: string }) {
  return (
    <div className="stat-card relative overflow-hidden">
      <div className="absolute top-0 right-0 left-0 h-[3px] rounded-t-[20px]" style={{background: color || 'var(--green)'}} />
      <span className="text-2xl leading-none mb-2">{emoji}</span>
      <div className="text-3xl font-black" style={{color: color || 'var(--green)'}}>{value}</div>
      <div className="stat-label leading-tight">{label}</div>
      {subLabel && <div className="text-[10px] text-gray-400 mt-0.5">{subLabel}</div>}
    </div>
  )
}

export default function FlockPage() {
  const [flock, setFlock] = useState<any>(null)
  const [rams, setRams] = useState<any[]>([])
  const [births, setBirths] = useState<any[]>([])
  const [tab, setTab] = useState<'flock'|'rams'>('flock')
  const [editing, setEditing] = useState(false)
  const [totalSheep, setTotalSheep] = useState(0)
  const [ramForm, setRamForm] = useState({ ram_id: '', name: '', color: '' })
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r => r.json()),
      fetch('/api/rams').then(r => r.json()),
      fetch('/api/births').then(r => r.json()),
    ]).then(([f, r, b]) => {
      setFlock(f.data)
      setTotalSheep(f.data?.total_sheep || 0)
      setRams(r.data || [])
      setBirths(b.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // ── إحصائيات ──
  const producerSet = new Set(births.map((r: any) => r.mom_id + '_' + r.mom_color))
  const producerCount = producerSet.size
  const breedingCount = births.filter((r: any) => r.in_breeding).length
  const activeRams = rams.filter(r => !r.dead)
  const deadRams = rams.filter(r => r.dead)

  let bahm = 0, rakhalWean = 0, rakhalReady = 0, kharafSale = 0, totalDeaths = 0
  const now = new Date()

  births.forEach((r: any) => {
    const bd = r.original_birth_date || r.birth_date
    const months = bd ? (now.getTime() - new Date(bd).getTime()) / (1000 * 60 * 60 * 24 * 30.44) : 0
    ;(r.babies || []).forEach((b: any) => {
      if (b.health === 'نفوق') { totalDeaths++; return }
      if (!b.stage && months < 3) bahm++
      if (b.gender === 'رخل') {
        if (b.stage === 'مفطوم' || (!b.stage && months >= 3 && months < 7)) rakhalWean++
        if (b.stage === 'جاهز للإنتاج' || (!b.stage && months >= 7)) rakhalReady++
      } else {
        if (b.stage === 'جاهز للبيع' || (!b.stage && months >= 3)) kharafSale++
      }
    })
  })

  async function saveFlock() {
    setSaving(true)
    const res = await fetch('/api/flock', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ total_sheep: totalSheep }) })
    const j = await res.json()
    setFlock(j.data); setEditing(false); setSaving(false); toast.success('تم الحفظ ✅')
  }

  async function addRam() {
    if (!ramForm.ram_id.trim()) { toast.error('رقم الفحل مطلوب'); return }
    setSaving(true)
    const res = await fetch('/api/rams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ramForm) })
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSaving(false); return }
    setRams(p => [j.data, ...p]); setShowNew(false); setRamForm({ ram_id: '', name: '', color: '' }); setSaving(false)
    toast.success('تمت الإضافة ✅')
  }

  async function markDead(id: string) {
    await fetch(`/api/rams/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dead: true }) })
    setRams(p => p.map(r => r.id === id ? { ...r, dead: true } : r))
    toast.success('تم تحديث الفحل')
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="page-header">
        <div className="skeleton h-8 w-48 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">القطيع</h1>
          <p className="text-sm text-gray-400 mt-0.5">إجمالي ومراحل القطيع</p>
        </div>
        <div className="flex gap-2">
          {tab === 'flock' && !editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm px-3 py-2">✏️ تعديل</button>
          )}
          {tab === 'rams' && (
            <button onClick={() => setShowNew(p => !p)} className="btn-primary text-sm">
              {showNew ? 'إلغاء' : '＋ فحل'}
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 bg-[var(--beige-dark)] p-1 rounded-2xl">
        {[
          { k: 'flock', l: '🐑 القطيع' },
          { k: 'rams',  l: `🐏 الفحول (${activeRams.length})` }
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)}
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
              tab === t.k
                ? 'bg-white shadow-sm text-green-primary'
                : 'text-gray-500 hover:text-gray-700'
            )}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ════ TAB: FLOCK ════ */}
      {tab === 'flock' && (
        <div className="space-y-4">

          {/* إجمالي القطيع */}
          {editing ? (
            <div className="card space-y-4 border-[var(--green)] border-2">
              <h3 className="font-bold text-green-primary">تعديل إجمالي القطيع</h3>
              <div>
                <label className="label">عدد الأغنام الكلي</label>
                <input
                  type="number" min="0"
                  className="input text-3xl font-black text-center h-16"
                  value={totalSheep}
                  onChange={e => setTotalSheep(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={saveFlock} className="btn-primary flex-1" disabled={saving}>
                  {saving ? '⏳ جاري الحفظ...' : '💾 حفظ'}
                </button>
                <button onClick={() => { setEditing(false); setTotalSheep(flock?.total_sheep || 0) }} className="btn-secondary px-5">
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <div className="card relative overflow-hidden" style={{background:'linear-gradient(135deg,#fff 60%,var(--green-subtle))'}}>
              <div className="absolute top-0 right-0 left-0 h-1 rounded-t-[20px]" style={{background:'linear-gradient(90deg,var(--green),var(--gold))'}} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">إجمالي القطيع</p>
                  <div className="text-5xl font-black text-green-primary leading-none">{flock?.total_sheep || 0}</div>
                  <p className="text-sm text-gray-400 mt-1">رأس</p>
                </div>
                <div className="text-6xl opacity-20 select-none">🐑</div>
              </div>
            </div>
          )}

          {/* الإحصائيات الرئيسية */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard emoji="🐑" value={producerCount}   label="الأمهات المنتجات" color="var(--green)" />
            <StatCard emoji="🔗" value={breedingCount}   label="في الشبك" color="var(--gold)" />
            <StatCard emoji="🐏" value={activeRams.length} label="الفحول النشطة" color="#6366f1" />
          </div>

          {/* مراحل المواليد */}
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">مراحل المواليد</p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard emoji="🍼" value={bahm}        label="البهم" subLabel="0 – 3 أشهر"      color="#a855f7" />
              <StatCard emoji="🔔" value={rakhalWean}  label="رخال مفطومة" subLabel="3 – 7 أشهر" color="#f59e0b" />
              <StatCard emoji="🌿" value={rakhalReady} label="رخال جاهزة للإنتاج" subLabel="7+ أشهر" color="var(--green)" />
              <StatCard emoji="🏷️" value={kharafSale} label="خرفان للبيع" subLabel="3+ أشهر"    color="#ec4899" />
            </div>
          </div>

          {/* النفوق */}
          {totalDeaths > 0 && (
            <div className="card flex items-center gap-3 bg-red-50 border-red-100">
              <span className="text-2xl">💀</span>
              <div>
                <div className="text-lg font-black text-red-600">{totalDeaths}</div>
                <div className="text-xs text-red-400">حالة نفوق مسجلة</div>
              </div>
            </div>
          )}

          {/* ملخص */}
          <div className="card">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">ملخص سريع</p>
            {[
              { label: 'سجلات الولادة',   value: births.length,       icon: '📋' },
              { label: 'إجمالي المواليد', value: births.reduce((s:number,r:any) => s + (r.babies?.length||0), 0), icon: '🍼' },
              { label: 'الفحول الكلي',    value: rams.length,          icon: '🐏' },
              { label: 'الفحول النافقة',  value: deadRams.length,      icon: '💀' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <span>{row.icon}</span>{row.label}
                </span>
                <span className="text-base font-black text-green-primary">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════ TAB: RAMS ════ */}
      {tab === 'rams' && (
        <div className="space-y-3">

          {/* نموذج إضافة فحل */}
          {showNew && (
            <div className="card space-y-4 border-2 border-[var(--green)]">
              <h3 className="font-bold text-green-primary">إضافة فحل جديد</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">رقم الفحل *</label>
                  <input className="input" placeholder="F001" value={ramForm.ram_id}
                    onChange={e => setRamForm(p => ({ ...p, ram_id: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">الاسم (اختياري)</label>
                  <input className="input" placeholder="مثال: المبروك" value={ramForm.name}
                    onChange={e => setRamForm(p => ({ ...p, name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label text-xs">اللون</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setRamForm(p => ({ ...p, color: c }))}
                      className={cn('px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                        ramForm.color === c
                          ? 'bg-green-primary text-white border-transparent'
                          : 'bg-white border-[var(--border)] text-gray-600'
                      )}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addRam} className="btn-primary flex-1" disabled={saving}>
                  {saving ? '⏳...' : '💾 إضافة الفحل'}
                </button>
                <button onClick={() => { setShowNew(false); setRamForm({ ram_id:'',name:'',color:'' }) }}
                  className="btn-secondary px-4">إلغاء</button>
              </div>
            </div>
          )}

          {/* قائمة الفحول */}
          {rams.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-4xl mb-3">🐏</p>
              <p className="font-bold text-gray-500">لا توجد فحول مسجلة</p>
              <p className="text-sm text-gray-400 mt-1">اضغط + لإضافة فحل</p>
            </div>
          ) : (
            <>
              {/* الفحول النشطة */}
              {activeRams.length > 0 && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    نشط — {activeRams.length}
                  </p>
                  <div className="space-y-2">
                    {activeRams.map((r: any) => (
                      <div key={r.id} className="card-hover flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-subtle flex items-center justify-center text-lg font-black text-green-primary">
                            🐏
                          </div>
                          <div>
                            <p className="font-bold text-sm">{r.ram_id}{r.name && ` — ${r.name}`}</p>
                            <p className="text-xs text-gray-400">{r.color || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-green">نشط</span>
                          <button onClick={() => markDead(r.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                            نفوق
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* الفحول النافقة */}
              {deadRams.length > 0 && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    نافق — {deadRams.length}
                  </p>
                  <div className="space-y-2 opacity-50">
                    {deadRams.map((r: any) => (
                      <div key={r.id} className="card flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
                            💀
                          </div>
                          <div>
                            <p className="font-bold text-sm">{r.ram_id}{r.name && ` — ${r.name}`}</p>
                            <p className="text-xs text-gray-400">{r.color || '—'}</p>
                          </div>
                        </div>
                        <span className="badge badge-red">نافق</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
