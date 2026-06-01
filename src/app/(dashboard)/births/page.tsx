'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const G = '#1e5a10', GOLD = '#c9a84c', GOLDD = '#a8872e', GOLDS = '#fdf8ec'
const GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'

const COLOR_MAP: Record<string, { bg: string; color: string }> = {
  green:  { bg: '#dcfce7', color: '#15803d' },
  أخضر:  { bg: '#dcfce7', color: '#15803d' },
  red:    { bg: '#fef2f2', color: '#dc2626' },
  أحمر:  { bg: '#fef2f2', color: '#dc2626' },
  yellow: { bg: '#fefce8', color: '#ca8a04' },
  أصفر:  { bg: '#fefce8', color: '#ca8a04' },
  orange: { bg: '#fff7ed', color: '#ea580c' },
  برتقالي: { bg: '#fff7ed', color: '#ea580c' },
  white:  { bg: '#f8fafc', color: '#475569' },
  أبيض:  { bg: '#f8fafc', color: '#475569' },
  black:  { bg: '#e2e8f0', color: '#1e293b' },
  أسود:  { bg: '#e2e8f0', color: '#1e293b' },
}

export default function BirthsPage() {
  const [births, setBirths]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<'all' | 'breeding' | 'home'>('all')

  useEffect(() => {
    fetch('/api/births')
      .then(r => r.json())
      .then(j => { setBirths(j.data || []); setLoading(false) })
  }, [])

  const breedingCount = births.filter(b => b.in_breeding).length
  const homeCount     = births.filter(b => !b.in_breeding).length
  const totalAlive    = births.reduce(
    (sum, b) => sum + (b.babies || []).filter((bb: any) => bb.health !== 'نفوق').length,
    0
  )

  const filtered = births.filter(b => {
    const q      = search.toLowerCase()
    const matchQ = !q || b.mom_id?.toString().toLowerCase().includes(q) || b.mom_color?.toLowerCase().includes(q)
    const matchF =
      filter === 'all' ||
      (filter === 'breeding' && b.in_breeding) ||
      (filter === 'home'     && !b.in_breeding)
    return matchQ && matchF
  })

  const card: React.CSSProperties = {
    background: 'white', borderRadius: 20, border: `1px solid ${BDR}`,
    padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ height: 32, width: 200, borderRadius: 10, background: BDARK }} className="skeleton" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: 88, borderRadius: 20, background: BDARK }} className="skeleton" />
        ))}
      </div>
      <div style={{ height: 44, borderRadius: 14, background: BDARK }} className="skeleton" />
      <div style={{ height: 44, borderRadius: 16, background: BDARK }} className="skeleton" />
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{ height: 80, borderRadius: 20, background: BDARK }} className="skeleton" />
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: G, margin: 0 }}>سجل الولادات</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>
            {births.length} سجل مسجّل
          </p>
        </div>
        <Link
          href="/births/new"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: G, color: 'white', borderRadius: 14,
            padding: '10px 18px', textDecoration: 'none',
            fontSize: 14, fontWeight: 700, boxShadow: `0 4px 14px ${G}44`,
          }}
        >
          ＋ ولادة
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { l: 'إجمالي الأمهات', v: births.length,   icon: '🐑', c: G,         bg: GSUBT },
          { l: 'في الشبك',       v: breedingCount,    icon: '🔗', c: GOLDD,     bg: GOLDS },
          { l: 'مواليد أحياء',   v: totalAlive,       icon: '🍼', c: '#7c3aed', bg: '#f5f3ff' },
        ].map(s => (
          <div
            key={s.l}
            style={{
              ...card, background: s.bg, border: `1px solid ${s.c}22`,
              textAlign: 'center', padding: '10px 6px',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.c, borderRadius: '20px 20px 0 0' }} />
            <div style={{ fontSize: 20, marginTop: 4, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: s.c, opacity: 0.8, fontWeight: 600, marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', right: 14, top: '50%',
          transform: 'translateY(-50%)', fontSize: 16,
          color: '#9ca3af', pointerEvents: 'none',
        }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث برقم أو لون الأم..."
          style={{
            width: '100%', background: BEIGE, border: `1.5px solid ${BDR}`,
            borderRadius: 14, padding: '11px 44px 11px 14px',
            fontFamily: 'inherit', fontSize: 14, outline: 'none',
            boxSizing: 'border-box', color: '#111827',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, background: BDARK, padding: 4, borderRadius: 16 }}>
        {[
          { k: 'all',      l: `الكل (${births.length})` },
          { k: 'breeding', l: `🔗 الشبك (${breedingCount})` },
          { k: 'home',     l: `🏠 المراح (${homeCount})` },
        ].map(f => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k as any)}
            style={{
              flex: 1, padding: '9px 4px', borderRadius: 12,
              border: 'none', fontFamily: 'inherit', fontSize: 12,
              fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
              background: filter === f.k ? 'white' : 'transparent',
              color:      filter === f.k ? G      : '#6b7280',
              boxShadow:  filter === f.k ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 12px' }}>🐑</p>
          <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>لا توجد سجلات</p>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>جرّب تغيير الفلتر أو البحث</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((b: any) => {
            const alive      = (b.babies || []).filter((bb: any) => bb.health !== 'نفوق').length
            const dead       = (b.babies || []).filter((bb: any) => bb.health === 'نفوق').length
            const colorStyle = COLOR_MAP[b.mom_color?.toLowerCase()] ||
                               COLOR_MAP[b.mom_color] ||
                               { bg: '#f3f4f6', color: '#6b7280' }

            let daysLeft: number | null = null
            if (b.in_breeding && b.breeding_date) {
              const exp = new Date(b.breeding_date)
              exp.setDate(exp.getDate() + 150)
              daysLeft = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            }

            const daysSince = b.birth_date
              ? Math.round((Date.now() - new Date(b.birth_date).getTime()) / (1000 * 60 * 60 * 24))
              : null
            const canBreed = daysSince !== null && daysSince >= 15 && !b.in_breeding

            const borderColor =
              b.in_breeding && daysLeft !== null && daysLeft <= 7 ? '#fca5a5' :
              b.in_breeding                                       ? `${GOLD}55` :
              BDR

            return (
              <Link
                key={b.id}
                href={`/births/${b.id}`}
                style={{
                  ...card,
                  display: 'flex', alignItems: 'center', gap: 12,
                  textDecoration: 'none', color: 'inherit',
                  borderColor, transition: 'box-shadow .15s',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 15,
                  background: colorStyle.bg, color: colorStyle.color,
                }}>
                  {b.mom_id}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{b.mom_id}</span>
                    {b.mom_color && (
                      <span style={{
                        background: colorStyle.bg, color: colorStyle.color,
                        padding: '1px 7px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                      }}>
                        {b.mom_color}
                      </span>
                    )}
                    {b.in_breeding && (
                      <span style={{
                        background: GOLDS, color: GOLDD,
                        padding: '1px 7px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                      }}>
                        🔗 شبك
                      </span>
                    )}
                    {canBreed && (
                      <span style={{
                        background: '#f3f4f6', color: '#6b7280',
                        padding: '1px 7px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                      }}>
                        ⏳ جاهزة للشبك
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span>📅 {b.birth_date}</span>
                    <span>🍼 {alive} حي{dead > 0 ? ` · 💀 ${dead}` : ''}</span>
                    <span>📦 {(b.babies || []).length} إجمالي</span>
                  </div>

                  {daysLeft !== null && (
                    <div style={{
                      marginTop: 4, fontSize: 11, fontWeight: 700,
                      color: daysLeft <= 0  ? '#dc2626' :
                             daysLeft <= 7  ? '#dc2626' :
                             daysLeft <= 14 ? '#d97706' : GOLDD,
                    }}>
                      {daysLeft < 0
                        ? `⚠️ متأخرة ${Math.abs(daysLeft)} يوم`
                        : daysLeft === 0
                        ? '🤱 اليوم!'
                        : `⏰ ${daysLeft} يوم للولادة`}
                    </div>
                  )}
                </div>

                {daysLeft !== null ? (
                  <div style={{
                    textAlign: 'center', minWidth: 46, padding: '6px 8px',
                    borderRadius: 12, fontWeight: 900, fontSize: 20, flexShrink: 0,
                    background: daysLeft <= 7  ? '#fef2f2' :
                                daysLeft <= 14 ? '#fff7ed' : GOLDS,
                    color:      daysLeft <= 7  ? '#dc2626' :
                                daysLeft <= 14 ? '#ea580c' : GOLDD,
                  }}>
                    {Math.abs(daysLeft)}
                    <div style={{ fontSize: 9, fontWeight: 500, opacity: 0.8 }}>يوم</div>
                  </div>
                ) : (
                  <span style={{ color: '#d1d5db', fontSize: 18, flexShrink: 0 }}>←</span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
