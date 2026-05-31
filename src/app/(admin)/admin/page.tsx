'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const G = '#1e5a10', BEIGE = '#f8f4ee', BDR = '#d8cfc3'

export default function AdminPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(j => { setData(j.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const card: React.CSSProperties = {
    background: 'white', borderRadius: 20, border: `1px solid ${BDR}`,
    padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 96, borderRadius: 20, background: '#e5e7eb' }} />
      ))}
    </div>
  )

  if (!data) return (
    <div style={{ ...card, textAlign: 'center', padding: '48px 20px' }}>
      <p style={{ fontSize: 40, margin: '0 0 12px' }}>🔒</p>
      <p style={{ fontWeight: 700, margin: '0 0 4px' }}>غير مصرح</p>
      <p style={{ fontSize: 12, color: '#9ca3af' }}>هذه الصفحة للمديرين فقط</p>
    </div>
  )

  const stats = [
    { l: 'إجمالي المستخدمين', v: data.totalUsers || 0, icon: '👥', href: '/admin/users' },
    { l: 'الاشتراكات النشطة', v: data.activeSubscriptions || 0, icon: '💳', href: '/admin/users' },
    { l: 'التذاكر المفتوحة', v: data.openTickets || 0, icon: '🎫', href: '/admin/tickets' },
    { l: 'توكنات AI', v: (data.totalTokensUsed || 0).toLocaleString('ar'), icon: '🤖', href: '/admin/stats' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: G, margin: 0 }}>📊 لوحة الإدارة</h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>إحصائيات ومتابعة النظام</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map(s => (
          <Link key={s.l} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{ ...card, cursor: 'pointer' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: G }}>{s.v}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{s.l}</div>
            </div>
          </Link>
        ))}
      </div>
      {(data.recentUsers || []).length > 0 && (
        <div style={card}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', margin: '0 0 12px', textTransform: 'uppercase' as const, letterSpacing: 1 }}>👥 آخر المسجلين</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data.recentUsers || []).slice(0, 5).map((u: any) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', fontWeight: 700, flexShrink: 0 }}>
                  {(u.full_name || u.email || '?')[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{u.full_name || '—'}</p>
                  <p style={{ margin: '1px 0 0', fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{u.email}</p>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 700, flexShrink: 0, background: u.role === 'admin' ? '#fee2e2' : '#f3f4f6', color: u.role === 'admin' ? '#dc2626' : '#6b7280' }}>
                  {u.role === 'admin' ? 'مدير' : u.subscription_plan === 'lifetime' ? 'دائم' : u.subscription_plan === 'monthly' ? 'شهري' : 'تجريبي'}
                </span>
              </div>
            ))}
          </div>
          <Link href="/admin/users" style={{ display: 'block', textAlign: 'center', fontSize: 12, color: G, marginTop: 12, textDecoration: 'none', fontWeight: 600 }}>عرض الكل ←</Link>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { href: '/admin/users', icon: '👥', label: 'المستخدمون' },
          { href: '/admin/tickets', icon: '🎫', label: 'التذاكر' },
          { href: '/admin/stats', icon: '📈', label: 'الإحصائيات' },
          { href: '/admin/settings', icon: '⚙️', label: 'الإعدادات' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>{a.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
