'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
    <div className="min-h-screen bg-beige-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-primary rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">🐑</div>
          <h1 className="text-2xl font-black text-green-primary">المراح</h1>
          <p className="text-sm text-gray-500">منصة إدارة المواشي</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-6">تسجيل الدخول</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input type="email" className="input" dir="ltr" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-green-primary hover:underline">نسيت كلمة المرور؟</Link>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'جاري الدخول...' : 'دخول'}</button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          ليس لديك حساب؟ <Link href="/auth/register" className="text-green-primary font-medium">إنشاء حساب</Link>
        </p>
      </div>
    </div>
  )
}
