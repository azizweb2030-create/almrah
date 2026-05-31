'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const G = '#1e5a10'
const BEIGE = '#f8f4ee'
const BDR = '#d8cfc3'
const GOLD = '#c9a84c'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) { setError('بيانات الدخول غير صحيحة'); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', background:BEIGE, display:'flex', alignItems:'center', justifyContent:'center', padding:16, fontFamily:'Tajawal,sans-serif', direction:'rtl' }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:64, height:64, background:G, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:32 }}>🐑</div>
          <h1 style={{ fontSize:24, fontWeight:900, color:G, margin:0 }}>المراح</h1>
          <p style={{ fontSize:14, color:'#6b7280', margin:'4px 0 0' }}>منصة إدارة المواشي</p>
        </div>
        <div style={{ background:'white', borderRadius:24, border:`1px solid ${BDR}`, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 20px' }}>تسجيل الدخول</h2>
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b', borderRadius:12, padding:'12px 16px', marginBottom:16, fontSize:14 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>البريد الإلكتروني</label>
              <input type="email" dir="ltr" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width:'100%', background:BEIGE, border:`1px solid ${BDR}`, borderRadius:12, padding:'10px 16px', fontSize:14, outline:'none', boxSizing:'border-box' }}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>كلمة المرور</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width:'100%', background:BEIGE, border:`1px solid ${BDR}`, borderRadius:12, padding:'10px 16px', fontSize:14, outline:'none', boxSizing:'border-box' }}/>
            </div>
            <div style={{ textAlign:'left' }}>
              <Link href="/forgot-password" style={{ fontSize:13, color:G, textDecoration:'none' }}>نسيت كلمة المرور؟</Link>
            </div>
            <button type="submit" disabled={loading}
              style={{ background:G, color:'white', border:'none', borderRadius:12, padding:'12px', fontSize:15, fontWeight:600, cursor:'pointer', opacity:loading?0.7:1 }}>
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', fontSize:14, color:'#6b7280', marginTop:16 }}>
          ليس لديك حساب؟{' '}
          <Link href="/register" style={{ color:G, fontWeight:600, textDecoration:'none' }}>إنشاء حساب</Link>
        </p>
      </div>
    </div>
  )
}
