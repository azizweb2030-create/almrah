'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', farmName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) { setError('كلمة المرور 6 أحرف على الأقل'); return }
    setLoading(true); setError('')
    const { error } = await createClient().auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, farm_name: form.farmName } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    // إرسال welcome email في الخلفية
    fetch('/api/auth/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, name: form.name })
    }).catch(() => {})
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-beige-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-primary rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">🐑</div>
          <h1 className="text-2xl font-black text-green-primary">المراح</h1>
          <p className="text-sm text-gray-500">7 أيام تجريبية مجانية</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-6">إنشاء حساب</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">الاسم الكامل *</label>
              <input className="input" placeholder="اسمك الكريم" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">اسم المراح</label>
              <input className="input" placeholder="اختياري" value={form.farmName} onChange={e => setForm(p => ({ ...p, farmName: e.target.value }))} />
            </div>
            <div>
              <label className="label">البريد الإلكتروني *</label>
              <input type="email" className="input" dir="ltr" placeholder="example@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">كلمة المرور *</label>
              <input type="password" className="input" placeholder="6 أحرف على الأقل" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? '⏳ جاري الإنشاء...' : '✅ إنشاء الحساب'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          لديك حساب؟ <Link href="/login" className="text-green-primary font-medium">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  )
}
