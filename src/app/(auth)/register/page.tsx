'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const G='#1e5a10', BEIGE='#f8f4ee', BDR='#d8cfc3'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name:'', farmName:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) { setError('كلمة المرور 6 أحرف على الأقل'); return }
    setLoading(true); setError('')
    const { error } = await createClient().auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.name, farm_name: form.farmName } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    fetch('/api/auth/welcome', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: form.email, name: form.name }) }).catch(()=>{})
    router.push('/dashboard')
  }

  const inputStyle = { width:'100%', background:BEIGE, border:`1px solid ${BDR}`, borderRadius:12, padding:'10px 16px', fontSize:14, outline:'none', boxSizing:'border-box' as any }
  const labelStyle = { display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }

  return (
    <div style={{ minHeight:'100vh', background:BEIGE, display:'flex', alignItems:'center', justifyContent:'center', padding:16, fontFamily:'Tajawal,sans-serif', direction:'rtl' }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:64, height:64, background:G, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:32 }}>🐑</div>
          <h1 style={{ fontSize:24, fontWeight:900, color:G, margin:0 }}>المراح</h1>
          <p style={{ fontSize:14, color:'#6b7280', margin:'4px 0 0' }}>7 أيام تجريبية مجانية</p>
        </div>
        <div style={{ background:'white', borderRadius:24, border:`1px solid ${BDR}`, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 20px' }}>إنشاء حساب</h2>
          {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b', borderRadius:12, padding:'12px 16px', marginBottom:16, fontSize:14 }}>{error}</div>}
          <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div><label style={labelStyle}>الاسم الكامل *</label><input style={inputStyle} placeholder="اسمك الكريم" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required/></div>
            <div><label style={labelStyle}>اسم المراح</label><input style={inputStyle} placeholder="اختياري" value={form.farmName} onChange={e=>setForm(p=>({...p,farmName:e.target.value}))}/></div>
            <div><label style={labelStyle}>البريد الإلكتروني *</label><input type="email" dir="ltr" style={inputStyle} placeholder="example@email.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required/></div>
            <div><label style={labelStyle}>كلمة المرور *</label><input type="password" style={inputStyle} placeholder="6 أحرف على الأقل" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required/></div>
            <button type="submit" disabled={loading}
              style={{ background:G, color:'white', border:'none', borderRadius:12, padding:'12px', fontSize:15, fontWeight:600, cursor:'pointer', marginTop:4, opacity:loading?0.7:1 }}>
              {loading ? '⏳ جاري الإنشاء...' : '✅ إنشاء الحساب'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', fontSize:14, color:'#6b7280', marginTop:16 }}>
          لديك حساب؟{' '}<Link href="/login" style={{ color:G, fontWeight:600, textDecoration:'none' }}>تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  )
}
